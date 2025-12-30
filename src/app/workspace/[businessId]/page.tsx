'use client'

import { useEffect, useState, use, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSSEStream } from '@/hooks/useSSEStream'
import { WorkspaceTabs } from '@/components/workspace/WorkspaceTabs'
import { SideChat, type SidebarTab } from '@/components/workspace/SideChat'
import { PromoBanner } from '@/components/workspace/PromoBanner'
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader'
import { TabBar } from '@/components/workspace/TabBar'
import { GlobalNav } from '@/components/shared/GlobalNav'
import type { Business } from '@/types'
import type { User } from '@supabase/supabase-js'

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ businessId: string }>
}) {
  const { businessId } = use(params)
  const [business, setBusiness] = useState<Business | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('chat')
  const router = useRouter()
  const supabase = createClient()

  // Fetch user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handlePublish = () => {
    // TODO: Implement publish functionality
    console.log('Publish clicked')
  }

  const fetchBusiness = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()

    if (error || !data) {
      console.error('Failed to fetch business:', error)
      router.push('/')
      return
    }

    setBusiness(data as Business)
    setLoading(false)
  }, [businessId, router])

  // Memoize options to prevent infinite loop
  const options = useMemo(
    () => ({
      onComplete: () => {
        fetchBusiness()
      },
    }),
    [fetchBusiness]
  )

  const {
    events,
    isStreaming,
    isComplete,
    startStream,
  } = useSSEStream(businessId, options)

  // Initial fetch
  useEffect(() => {
    fetchBusiness()
  }, [businessId])

  // Start stream if business is pending
  useEffect(() => {
    if (business?.status === 'pending' && !isStreaming) {
      startStream()
    }
  }, [business?.status, isStreaming, startStream])

  // Force refetch when generation completes
  useEffect(() => {
    if (isComplete) {
      fetchBusiness()
    }
  }, [isComplete, fetchBusiness])

  // Subscribe to realtime updates
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`business-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'businesses',
          filter: `id=eq.${businessId}`,
        },
        (payload) => {
          setBusiness(payload.new as Business)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [businessId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Business not found</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Global Nav */}
      <GlobalNav user={user} tier="Free" onSignOut={handleLogout} />

      {/* Promotional Banner */}
      <PromoBanner />

      {/* Main Header */}
      <WorkspaceHeader
        business={business}
        user={user}
        onSignOut={handleLogout}
        onPublish={handlePublish}
      />

      {/* Tab Bar - contains both sidebar tabs and content tabs */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sidebarTab={sidebarTab}
        onSidebarTabChange={setSidebarTab}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SideChat
          businessId={businessId}
          context={{ section: activeTab }}
          disabled={isStreaming}
          events={events}
          isStreaming={isStreaming}
          onBusinessUpdate={fetchBusiness}
          collapsed={sidebarCollapsed}
          sidebarTab={sidebarTab}
        />

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <WorkspaceTabs
            business={business}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
    </div>
  )
}

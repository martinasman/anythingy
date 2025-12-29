'use client'

import { useEffect, useState, use, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useSSEStream } from '@/hooks/useSSEStream'
import { WorkspaceTabs } from '@/components/workspace/WorkspaceTabs'
import { SideChat } from '@/components/workspace/SideChat'
import { Button } from '@/components/ui/button'
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

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'brand', label: 'Brand' },
    { id: 'website', label: 'Website' },
    { id: 'flow', label: 'Flow' },
    { id: 'analytics', label: 'Analytics' },
  ]

  return (
    <div className="h-screen bg-background flex">
      {/* Left Sidebar - Chat */}
      <div className="w-96 border-r border-border flex flex-col shrink-0">
        <SideChat
          businessId={businessId}
          context={{ section: activeTab }}
          disabled={isStreaming}
          events={events}
          isStreaming={isStreaming}
          onBusinessUpdate={fetchBusiness}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Unified Header with Tabs */}
        <header className="h-12 border-b border-border flex items-center px-4 shrink-0 bg-white">
          {/* Left: Back + Business Name */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push('/')}
              className="text-muted-foreground hover:text-foreground transition-colors text-lg"
            >
              ←
            </button>
            <span className="text-foreground font-semibold truncate max-w-[180px]">
              {business.business_name || 'New Business'}
            </span>
          </div>

          {/* Center: Tabs */}
          <nav className="flex-1 flex items-center justify-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right: Status + User */}
          <div className="flex items-center gap-3">
            {business.status === 'running' && (
              <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-700 rounded-full">
                Generating...
              </span>
            )}
            {business.status === 'completed' && (
              <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                Complete
              </span>
            )}
            {business.status === 'failed' && (
              <span className="px-2 py-0.5 text-xs bg-destructive/20 text-destructive rounded-full">
                Failed
              </span>
            )}
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
                Sign out
              </Button>
            ) : (
              <Link href="/login">
                <Button size="sm">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* Tab Content */}
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

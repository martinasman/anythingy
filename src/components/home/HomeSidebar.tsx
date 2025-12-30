'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, Briefcase } from 'lucide-react'

interface Business {
  id: string
  business_name: string | null
  status: string
  created_at: string
  prompt: string
}

interface HomeSidebarProps {
  userId: string
  onNewClick?: () => void
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: 'bg-green-500',
    running: 'bg-yellow-500 animate-pulse',
    pending: 'bg-gray-400',
    failed: 'bg-red-500',
  }

  return (
    <span className={`w-2 h-2 rounded-full shrink-0 ${colors[status] || colors.pending}`} />
  )
}

function BusinessItem({ business, onClick }: { business: Business; onClick: () => void }) {
  const displayName = business.business_name || business.prompt?.slice(0, 30) || 'Untitled'

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left group"
    >
      <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
          {displayName}
        </p>
      </div>
      <StatusDot status={business.status} />
    </button>
  )
}

export function HomeSidebar({ userId, onNewClick }: HomeSidebarProps) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchBusinesses = async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, business_name, status, created_at, prompt')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Failed to fetch businesses:', error)
      } else {
        setBusinesses(data || [])
      }
      setLoading(false)
    }

    fetchBusinesses()

    // Subscribe to realtime updates
    const channel = supabase
      .channel('home-businesses')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'businesses',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchBusinesses()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const handleBusinessClick = (businessId: string) => {
    router.push(`/workspace/${businessId}`)
  }

  return (
    <aside className="w-64 border-r border-border bg-muted/30 flex flex-col h-full shrink-0">
      {/* New button */}
      <div className="p-4 border-b border-border">
        <Button
          className="w-full"
          onClick={onNewClick}
          variant="default"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Business
        </Button>
      </div>

      {/* Recent header */}
      <div className="px-4 py-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
          Recent
        </span>
      </div>

      {/* Business list */}
      <div className="flex-1 overflow-auto px-2 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Briefcase className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No projects yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Create your first business above
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {businesses.map((business) => (
              <BusinessItem
                key={business.id}
                business={business}
                onClick={() => handleBusinessClick(business.id)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

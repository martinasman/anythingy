'use client'

import { useRouter } from 'next/navigation'
import { Settings, Code, FileText, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Business } from '@/types'
import type { User } from '@supabase/supabase-js'

interface WorkspaceHeaderProps {
  business: Business
  user: User | null
  onSignOut: () => void
  onPublish?: () => void
}

export function WorkspaceHeader({ business, user, onSignOut, onPublish }: WorkspaceHeaderProps) {
  const router = useRouter()

  return (
    <header className="h-12 bg-white border-b border-border flex items-center px-4 shrink-0">
      {/* Left: Logo + Business Name */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => router.push('/')}
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <span style={{ fontFamily: 'Times New Roman, serif' }} className="text-foreground font-semibold text-lg">
            Anything
          </span>
        </button>

        <span className="text-muted-foreground mx-1">/</span>

        <span className="text-foreground font-medium truncate max-w-[200px]">
          {business.business_name || 'New Business'}
        </span>

        {/* Status Badge - only show Draft or Failed, not Complete */}
        {(business.status === 'pending' || business.status === 'running') && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-amber-500/20 text-amber-600 rounded">
            Draft
          </span>
        )}
        {business.status === 'failed' && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-red-500/20 text-red-600 rounded">
            Failed
          </span>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* User Dropdown */}
        {user && (
          <button className="flex items-center gap-1 px-2 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
            <span className="max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        )}

        {/* Icon buttons */}
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
          <Code className="w-4 h-4" />
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
          <FileText className="w-4 h-4" />
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
          <Settings className="w-4 h-4" />
        </button>

        {/* Publish Button */}
        <Button
          onClick={onPublish}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white ml-2"
        >
          Publish
        </Button>
      </div>
    </header>
  )
}

'use client'

import { ChevronDown, HelpCircle, ExternalLink } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface GlobalNavProps {
  user: User | null
  tier?: 'Free' | 'Pro' | 'Enterprise'
  onSignOut?: () => void
}

export function GlobalNav({ user, tier = 'Free', onSignOut }: GlobalNavProps) {
  const userName = user?.email?.split('@')[0] || 'Guest'

  return (
    <nav className="h-10 bg-muted/50 border-b border-border flex items-center justify-between px-4 shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <span className="text-lg font-bold tracking-tight text-primary">()</span>

        {/* Divider */}
        <div className="w-px h-5 bg-border" />

        {/* User info with colored dot */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-sm font-medium text-foreground">{userName}</span>
        </div>

        {/* Tier badge */}
        <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
          {tier}
        </span>

        {/* Dropdown chevron */}
        <button
          className="p-1 hover:bg-muted rounded transition-colors"
          onClick={onSignOut}
          title="Sign out"
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/anthropics/claude-code/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Support & Feedback</span>
        </a>
        <a
          href="#"
          className="p-1.5 hover:bg-muted rounded transition-colors"
          title="Share"
        >
          <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </a>
      </div>
    </nav>
  )
}

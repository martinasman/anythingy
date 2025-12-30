'use client'

import { LayoutGrid, Palette, Globe, GitBranch, BarChart3, MessageSquare, History, ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import type { ReactNode } from 'react'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
}

type SidebarTab = 'chat' | 'history'

interface TabBarProps {
  activeTab: string
  onTabChange: (tabId: string) => void
  sidebarTab: SidebarTab
  onSidebarTabChange: (tab: SidebarTab) => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'brand', label: 'Brand', icon: <Palette className="w-4 h-4" /> },
  { id: 'website', label: 'Website', icon: <Globe className="w-4 h-4" /> },
  { id: 'flow', label: 'Flow', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
]

export function TabBar({
  activeTab,
  onTabChange,
  sidebarTab,
  onSidebarTabChange,
  sidebarCollapsed,
  onToggleSidebar,
}: TabBarProps) {
  return (
    <div className="h-10 bg-background border-b border-border flex shrink-0">
      {/* Sidebar tabs section */}
      <div className="shrink-0 border-r border-border flex items-center px-2 gap-1" style={{ width: sidebarCollapsed ? 48 : 320 }}>
        {sidebarCollapsed ? (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <>
            <button
              onClick={() => onSidebarTabChange('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                sidebarTab === 'chat'
                  ? 'text-foreground bg-muted'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => onSidebarTabChange('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                sidebarTab === 'history'
                  ? 'text-foreground bg-muted'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
            <div className="flex-1" />
            <button
              onClick={onToggleSidebar}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Content tabs */}
      <nav className="flex items-center px-2 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              activeTab === tab.id
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

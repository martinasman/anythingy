'use client'

import {
  LayoutGrid,
  Palette,
  Globe,
  GitBranch,
  BarChart3,
  MessageSquare,
  History,
  ChevronLeft,
  ChevronRight,
  Settings,
  Eye,
  Code,
  Monitor,
  Tablet,
  Smartphone,
  Download,
} from 'lucide-react'
import type { ReactNode } from 'react'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
}

type SidebarTab = 'chat' | 'history'
type WebsiteViewMode = 'preview' | 'code'
type WebsiteViewport = 'desktop' | 'tablet' | 'mobile'

interface TabBarProps {
  activeTab: string
  onTabChange: (tabId: string) => void
  sidebarTab: SidebarTab
  onSidebarTabChange: (tab: SidebarTab) => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  // Website-specific controls (only shown when Website tab is active)
  websitePages?: { name: string; slug: string }[]
  currentPageSlug?: string
  onPageChange?: (slug: string) => void
  viewMode?: WebsiteViewMode
  onViewModeChange?: (mode: WebsiteViewMode) => void
  viewport?: WebsiteViewport
  onViewportChange?: (viewport: WebsiteViewport) => void
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
  // Website controls
  websitePages,
  currentPageSlug,
  onPageChange,
  viewMode = 'preview',
  onViewModeChange,
  viewport = 'desktop',
  onViewportChange,
}: TabBarProps) {
  const showWebsiteControls = activeTab === 'website'

  return (
    <div className="h-10 bg-background border-b border-border flex shrink-0">
      {/* Sidebar tabs section */}
      <div
        className="shrink-0 border-r border-border flex items-center px-2 gap-1"
        style={{ width: sidebarCollapsed ? 48 : 320 }}
      >
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

      {/* Right side: Website controls (only when Website tab is active) */}
      {showWebsiteControls && (
        <div className="flex items-center gap-1 ml-auto pr-3">
          {/* Page tabs */}
          {websitePages && websitePages.length > 1 && (
            <>
              {websitePages.map((page) => (
                <button
                  key={page.slug}
                  onClick={() => onPageChange?.(page.slug)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    currentPageSlug === page.slug
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {page.name}
                </button>
              ))}
              {/* Separator */}
              <div className="w-px h-5 bg-border mx-1.5" />
            </>
          )}

          {/* Preview/Code toggle */}
          <button
            onClick={() => onViewModeChange?.('preview')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'preview'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange?.('code')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'code'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>

          {/* Separator */}
          <div className="w-px h-5 bg-border mx-1.5" />

          {/* Viewport buttons */}
          <button
            onClick={() => onViewportChange?.('desktop')}
            className={`p-1.5 rounded transition-colors ${
              viewport === 'desktop'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Desktop"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewportChange?.('tablet')}
            className={`p-1.5 rounded transition-colors ${
              viewport === 'tablet'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Tablet"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewportChange?.('mobile')}
            className={`p-1.5 rounded transition-colors ${
              viewport === 'mobile'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Mobile"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

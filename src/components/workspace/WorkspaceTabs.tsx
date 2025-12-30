'use client'

import { Card } from '@/components/ui/card'
import { WebsitePreview } from './WebsitePreview'
import { FlowBuilder } from './FlowBuilder'
import { OverviewTab } from './OverviewTab'
import { SettingsPanel } from './SettingsPanel'
import type { Business } from '@/types'

interface WorkspaceTabsProps {
  business: Business
  activeTab: string
  onTabChange: (tab: string) => void
}

export function WorkspaceTabs({
  business,
  activeTab,
}: WorkspaceTabsProps) {
  return (
    <div className="h-full">
      {activeTab === 'overview' && (
        <div className="h-full overflow-auto">
          <OverviewTab business={business} />
        </div>
      )}

      {activeTab === 'brand' && (
        <div className="h-full overflow-auto p-6">
          <BrandTab business={business} />
        </div>
      )}

      {activeTab === 'website' && (
        <div className="h-full">
          <WebsitePreview business={business} />
        </div>
      )}

      {activeTab === 'flow' && (
        <div className="h-full">
          {business.customer_journey ? (
            <FlowBuilder customerJourney={business.customer_journey} />
          ) : (
            <div className="h-full flex items-center justify-center bg-[#1a1a1a] text-gray-400">
              Generating customer journey...
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="h-full overflow-auto p-6">
          <AnalyticsTab />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="h-full">
          <SettingsPanel />
        </div>
      )}
    </div>
  )
}


function BrandTab({ business }: { business: Business }) {
  if (!business.brand_colors) {
    return (
      <div className="flex items-center justify-center h-64 text-[#8B7B6E]">
        Generating brand identity...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#4A3F35]">Brand Identity</h2>

      {/* Logo */}
      {business.logo_url && (
        <Card className="p-6 bg-white border-[#E8DCC8]">
          <h3 className="font-medium text-[#4A3F35] mb-4">Logo</h3>
          <div className="flex justify-center">
            <img
              src={business.logo_url}
              alt="Logo"
              className="max-w-xs rounded-lg"
            />
          </div>
        </Card>
      )}

      {/* Colors */}
      <Card className="p-6 bg-white border-[#E8DCC8]">
        <h3 className="font-medium text-[#4A3F35] mb-4">Brand Colors</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(business.brand_colors).map(([name, color]) => (
            <div key={name} className="text-center">
              <div
                className="w-16 h-16 rounded-lg border border-[#D4C4AF] shadow-lg"
                style={{ backgroundColor: color }}
              />
              <p className="text-[#8B7B6E] text-xs mt-2 capitalize">{name}</p>
              <p className="text-[#8B7B6E] text-xs font-mono">{color}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Brand Voice */}
      {business.brand_voice && (
        <Card className="p-6 bg-white border-[#E8DCC8]">
          <h3 className="font-medium text-[#4A3F35] mb-2">Brand Voice</h3>
          <p className="text-[#4A3F35]">{business.brand_voice}</p>
        </Card>
      )}
    </div>
  )
}

function AnalyticsTab() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-[#8B7B6E]">
      <p className="text-lg">Analytics Dashboard</p>
      <p className="text-sm mt-2">Coming in V2</p>
    </div>
  )
}

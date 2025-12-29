'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { WebsitePreview } from './WebsitePreview'
import { FlowBuilder } from './FlowBuilder'
import type { Business } from '@/types'

interface WorkspaceTabsProps {
  business: Business
  activeTab: string
  onTabChange: (tab: string) => void
}

export function WorkspaceTabs({
  business,
  activeTab,
  onTabChange,
}: WorkspaceTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className="h-full flex flex-col"
    >
      <TabsList className="grid w-full grid-cols-5 bg-white border-b border-[#E8DCC8]">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="brand">Brand</TabsTrigger>
        <TabsTrigger value="website">Website</TabsTrigger>
        <TabsTrigger value="flow">Flow</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-hidden">
        <TabsContent value="overview" className="mt-0 h-full overflow-auto p-6">
          <OverviewTab business={business} />
        </TabsContent>

        <TabsContent value="brand" className="mt-0 h-full overflow-auto p-6">
          <BrandTab business={business} />
        </TabsContent>

        <TabsContent value="website" className="mt-0 h-full">
          <WebsitePreview business={business} />
        </TabsContent>

        <TabsContent value="flow" className="mt-0 h-full">
          {business.customer_journey ? (
            <FlowBuilder customerJourney={business.customer_journey} />
          ) : (
            <div className="h-full flex items-center justify-center bg-[#1a1a1a] text-gray-400">
              Generating customer journey...
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-0 h-full overflow-auto p-6">
          <AnalyticsTab />
        </TabsContent>
      </div>
    </Tabs>
  )
}

function OverviewTab({ business }: { business: Business }) {
  if (!business.business_canvas) {
    return (
      <div className="flex items-center justify-center h-64 text-[#8B7B6E]">
        Generating business strategy...
      </div>
    )
  }

  const canvas = business.business_canvas

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#4A3F35]">
          {business.business_name || 'Your Business'}
        </h2>
        {business.tagline && (
          <p className="text-[#8B7B6E] mt-1">{business.tagline}</p>
        )}
      </div>

      {/* Value Proposition */}
      <Card className="p-4 bg-white border-[#E8DCC8]">
        <h3 className="font-medium text-[#4A3F35] mb-2">Value Proposition</h3>
        <p className="text-[#4A3F35]">{canvas.value_proposition}</p>
      </Card>

      {/* Problem & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-white border-[#E8DCC8]">
          <h3 className="font-medium text-[#4A3F35] mb-2">Problem</h3>
          <p className="text-[#4A3F35] text-sm">{canvas.problem}</p>
        </Card>
        <Card className="p-4 bg-white border-[#E8DCC8]">
          <h3 className="font-medium text-[#4A3F35] mb-2">Solution</h3>
          <p className="text-[#4A3F35] text-sm">{canvas.solution}</p>
        </Card>
      </div>

      {/* Canvas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-[#E8DCC8]">
          <h3 className="font-medium text-[#4A3F35] mb-2">Customer Segments</h3>
          <ul className="space-y-1">
            {canvas.customer_segments.map((segment, i) => (
              <li key={i} className="text-[#4A3F35] text-sm">
                • {segment}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 bg-white border-[#E8DCC8]">
          <h3 className="font-medium text-[#4A3F35] mb-2">Channels</h3>
          <ul className="space-y-1">
            {canvas.channels.map((channel, i) => (
              <li key={i} className="text-[#4A3F35] text-sm">
                • {channel}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 bg-white border-[#E8DCC8]">
          <h3 className="font-medium text-[#4A3F35] mb-2">Key Activities</h3>
          <ul className="space-y-1">
            {canvas.key_activities.map((activity, i) => (
              <li key={i} className="text-[#4A3F35] text-sm">
                • {activity}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Revenue Streams */}
      <Card className="p-4 bg-white border-[#E8DCC8]">
        <h3 className="font-medium text-[#4A3F35] mb-3">Revenue Streams</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {canvas.revenue_streams.map((stream, i) => (
            <div
              key={i}
              className="p-3 bg-[#F5F1E8]/50 rounded-lg border border-[#D4C4AF]"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#4A3F35]">{stream.name}</span>
                <Badge variant="outline">{stream.type}</Badge>
              </div>
              <p className="text-[#8B7B6E] text-sm mt-1">{stream.pricing}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Unfair Advantage */}
      {canvas.unfair_advantage && (
        <Card className="p-4 bg-white border-[#E8DCC8]">
          <h3 className="font-medium text-[#4A3F35] mb-2">Unfair Advantage</h3>
          <p className="text-[#4A3F35]">{canvas.unfair_advantage}</p>
        </Card>
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

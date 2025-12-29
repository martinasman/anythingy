'use client'

import { useState } from 'react'
import { ChevronDown, Users, Megaphone, Settings, DollarSign, TrendingUp, Zap, Target, Lightbulb, Package, Handshake, BarChart3 } from 'lucide-react'
import type { Business, BusinessCanvas, RevenueStream, CostItem } from '@/types'

interface OverviewTabProps {
  business: Business
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
            <Icon className="w-4 h-4 text-neutral-600" />
          </div>
          <span className="font-medium text-neutral-900">{title}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`transition-all duration-200 ease-out ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-4 pt-0 border-t border-neutral-100">{children}</div>
      </div>
    </div>
  )
}

// Revenue Type Badge Component
function RevenueTypeBadge({ type }: { type: string }) {
  const getTypeStyles = () => {
    switch (type.toLowerCase()) {
      case 'recurring':
      case 'subscription':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'one-time':
      case 'transaction':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'usage':
      case 'usage-based':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-neutral-50 text-neutral-700 border-neutral-200'
    }
  }

  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getTypeStyles()}`}
    >
      {type}
    </span>
  )
}

// Revenue Card Component
function RevenueCard({ stream }: { stream: RevenueStream }) {
  return (
    <div className="p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-neutral-900">{stream.name}</h4>
        <RevenueTypeBadge type={stream.type} />
      </div>
      <p className="text-2xl font-bold text-neutral-900 mb-1">{stream.pricing}</p>
      {stream.description && (
        <p className="text-sm text-neutral-500">{stream.description}</p>
      )}
    </div>
  )
}

// Tag Component for lists
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-3 py-1.5 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-lg">
      {children}
    </span>
  )
}

// Cost Item Component
function CostItemRow({ cost }: { cost: CostItem }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-neutral-900">{cost.item}</span>
        <span
          className={`px-2 py-0.5 text-xs rounded-full ${
            cost.type === 'fixed'
              ? 'bg-neutral-100 text-neutral-600'
              : 'bg-amber-50 text-amber-700'
          }`}
        >
          {cost.type}
        </span>
      </div>
      <span className="font-medium text-neutral-900">{cost.amount}</span>
    </div>
  )
}

export function OverviewTab({ business }: OverviewTabProps) {
  if (!business.business_canvas) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-500">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 border-2 border-neutral-300 border-t-emerald-500 rounded-full animate-spin" />
          Generating business strategy...
        </div>
      </div>
    )
  }

  const canvas = business.business_canvas

  return (
    <div className="bg-neutral-50 min-h-full">
      <div className="max-w-5xl mx-auto py-8 px-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
            {business.business_name || 'Your Business'}
          </h1>
          {business.tagline && (
            <p className="text-lg text-neutral-500 mt-1">{business.tagline}</p>
          )}
        </div>

        {/* Problem & Solution - Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Problem Card */}
          <div className="p-6 bg-white border border-neutral-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <Target className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="font-semibold text-neutral-900">The Problem</h3>
            </div>
            <p className="text-neutral-600 leading-relaxed">{canvas.problem}</p>
          </div>

          {/* Solution Card */}
          <div className="p-6 bg-white border border-neutral-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-neutral-900">Our Solution</h3>
            </div>
            <p className="text-neutral-600 leading-relaxed">{canvas.solution}</p>
          </div>
        </div>

        {/* Value Proposition - Dark gradient card */}
        <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Value Proposition</h3>
          </div>
          <p className="text-xl text-neutral-100 leading-relaxed font-medium">
            {canvas.value_proposition}
          </p>
        </div>

        {/* Unfair Advantage - Amber highlight */}
        {canvas.unfair_advantage && (
          <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-700" />
              </div>
              <h3 className="font-semibold text-amber-900">Unfair Advantage</h3>
            </div>
            <p className="text-amber-800 leading-relaxed">
              {canvas.unfair_advantage}
            </p>
          </div>
        )}

        {/* Revenue Model */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-neutral-400" />
            <h3 className="font-semibold text-neutral-900">Revenue Model</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {canvas.revenue_streams.map((stream, i) => (
              <RevenueCard key={i} stream={stream} />
            ))}
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-3 pt-4">
          {/* Customers & Channels */}
          <CollapsibleSection title="Customers & Channels" icon={Users} defaultOpen>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
                  Customer Segments
                </h4>
                <div className="flex flex-wrap gap-2">
                  {canvas.customer_segments.map((segment, i) => (
                    <Tag key={i}>{segment}</Tag>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
                  Channels
                </h4>
                <div className="flex flex-wrap gap-2">
                  {canvas.channels.map((channel, i) => (
                    <Tag key={i}>{channel}</Tag>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Operations */}
          <CollapsibleSection title="Operations" icon={Settings}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div>
                <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Key Resources
                </h4>
                <ul className="space-y-2">
                  {canvas.key_resources.map((resource, i) => (
                    <li key={i} className="text-neutral-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-2 shrink-0" />
                      {resource}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Key Activities
                </h4>
                <ul className="space-y-2">
                  {canvas.key_activities.map((activity, i) => (
                    <li key={i} className="text-neutral-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-2 shrink-0" />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Handshake className="w-4 h-4" />
                  Key Partnerships
                </h4>
                <ul className="space-y-2">
                  {canvas.key_partnerships.map((partnership, i) => (
                    <li key={i} className="text-neutral-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-2 shrink-0" />
                      {partnership}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CollapsibleSection>

          {/* Financials */}
          <CollapsibleSection title="Financials" icon={DollarSign}>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
                Cost Structure
              </h4>
              <div className="bg-neutral-50 rounded-lg p-4">
                {canvas.cost_structure.map((cost, i) => (
                  <CostItemRow key={i} cost={cost} />
                ))}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  )
}

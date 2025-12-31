'use client'

import { useState } from 'react'
import { ChevronDown, Users, Settings, DollarSign, TrendingUp, Zap, Target, Lightbulb, Package, Handshake, BarChart3 } from 'lucide-react'
import type { Business, RevenueStream, CostItem } from '@/types'

interface OverviewTabProps {
  business: Business
}

// Color constants - Navy blue accent (#15315B) with lighter variants
const colors = {
  bg: '#F6F4F2',
  text: '#242424',
  textMuted: '#6B6B6B',
  textLight: '#8A8A8A',
  border: '#E5E3E0',
  borderLight: '#EDEBE8',
  // Bright blue accents (lighter shades of #1557F6)
  accent: '#1557F6',
  accentLight: '#4A7FF8',
  accentLighter: '#8AACFA',
  accentBg: '#E8EDF4',
  accentBgLight: '#F0F4F8',
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
    <div className="border rounded-xl bg-white overflow-hidden" style={{ borderColor: colors.border }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[#F6F4F2]"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.accentBgLight }}>
            <Icon className="w-4 h-4" style={{ color: colors.accentLight }} />
          </div>
          <span className="font-medium" style={{ color: colors.text }}>{title}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: colors.textLight }}
        />
      </button>
      <div
        className={`transition-all duration-200 ease-out ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-4 pt-0 border-t" style={{ borderColor: colors.borderLight }}>{children}</div>
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
        return { bg: colors.accentBg, text: colors.accent, border: '#C5D4E8' }
      case 'one-time':
      case 'transaction':
        return { bg: '#F0F4F8', text: colors.accentLight, border: '#D4DEE8' }
      case 'usage':
      case 'usage-based':
        return { bg: '#F5F3F0', text: '#5A5A5A', border: '#E0DDD8' }
      default:
        return { bg: '#F5F3F0', text: colors.textMuted, border: colors.border }
    }
  }

  const styles = getTypeStyles()

  return (
    <span
      className="px-2 py-0.5 text-xs font-medium rounded-full border"
      style={{ backgroundColor: styles.bg, color: styles.text, borderColor: styles.border }}
    >
      {type}
    </span>
  )
}

// Revenue Card Component
function RevenueCard({ stream }: { stream: RevenueStream }) {
  return (
    <div
      className="p-4 bg-white border rounded-xl hover:shadow-sm transition-all"
      style={{ borderColor: colors.border }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold" style={{ color: colors.text }}>{stream.name}</h4>
        <RevenueTypeBadge type={stream.type} />
      </div>
      <p className="text-2xl font-bold mb-1" style={{ color: colors.text }}>{stream.pricing}</p>
      {stream.description && (
        <p className="text-sm" style={{ color: colors.textMuted }}>{stream.description}</p>
      )}
    </div>
  )
}

// Tag Component for lists
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg"
      style={{ backgroundColor: colors.accentBgLight, color: colors.accentLight }}
    >
      {children}
    </span>
  )
}

// Cost Item Component
function CostItemRow({ cost }: { cost: CostItem }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: colors.borderLight }}>
      <div className="flex items-center gap-2">
        <span style={{ color: colors.text }}>{cost.item}</span>
        <span
          className="px-2 py-0.5 text-xs rounded-full"
          style={{
            backgroundColor: cost.type === 'fixed' ? '#F0F0F0' : colors.accentBgLight,
            color: cost.type === 'fixed' ? colors.textMuted : colors.accentLight
          }}
        >
          {cost.type}
        </span>
      </div>
      <span className="font-medium" style={{ color: colors.text }}>{cost.amount}</span>
    </div>
  )
}

export function OverviewTab({ business }: OverviewTabProps) {
  if (!business.business_canvas) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: colors.textMuted }}>
        <div className="flex items-center gap-3">
          <span
            className="w-5 h-5 border-2 rounded-full animate-spin"
            style={{ borderColor: colors.border, borderTopColor: colors.accent }}
          />
          Generating business strategy...
        </div>
      </div>
    )
  }

  const canvas = business.business_canvas

  return (
    <div className="min-h-full" style={{ backgroundColor: colors.bg }}>
      <div className="max-w-5xl mx-auto py-8 px-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: colors.text }}>
            {business.business_name || 'Your Business'}
          </h1>
          {business.tagline && (
            <p className="text-lg mt-1" style={{ color: colors.textMuted }}>{business.tagline}</p>
          )}
        </div>

        {/* Problem & Solution - Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Problem Card */}
          <div className="p-6 bg-white border rounded-xl" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                <Target className="w-4 h-4" style={{ color: '#B91C1C' }} />
              </div>
              <h3 className="font-semibold" style={{ color: colors.text }}>The Problem</h3>
            </div>
            <p className="leading-relaxed" style={{ color: colors.textMuted }}>{canvas.problem}</p>
          </div>

          {/* Solution Card */}
          <div className="p-6 bg-white border rounded-xl" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.accentBg }}>
                <Lightbulb className="w-4 h-4" style={{ color: colors.accent }} />
              </div>
              <h3 className="font-semibold" style={{ color: colors.text }}>Our Solution</h3>
            </div>
            <p className="leading-relaxed" style={{ color: colors.textMuted }}>{canvas.solution}</p>
          </div>
        </div>

        {/* Value Proposition - Dark gradient card */}
        <div className="p-6 rounded-xl" style={{ background: `linear-gradient(to bottom right, ${colors.accent}, #0A3AB3)` }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5" style={{ color: '#93B4E8' }} />
            <h3 className="font-semibold text-white">Value Proposition</h3>
          </div>
          <p className="text-xl leading-relaxed font-medium" style={{ color: '#E8EDF4' }}>
            {canvas.value_proposition}
          </p>
        </div>

        {/* Unfair Advantage - Light blue highlight */}
        {canvas.unfair_advantage && (
          <div
            className="p-6 border rounded-xl"
            style={{
              background: `linear-gradient(to bottom right, ${colors.accentBgLight}, #E0E8F0)`,
              borderColor: '#C5D4E8'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D4DEE8' }}>
                <TrendingUp className="w-4 h-4" style={{ color: colors.accent }} />
              </div>
              <h3 className="font-semibold" style={{ color: colors.accent }}>Unfair Advantage</h3>
            </div>
            <p className="leading-relaxed" style={{ color: colors.accentLight }}>
              {canvas.unfair_advantage}
            </p>
          </div>
        )}

        {/* Revenue Model */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" style={{ color: colors.textLight }} />
            <h3 className="font-semibold" style={{ color: colors.text }}>Revenue Model</h3>
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
                <h4 className="text-sm font-medium uppercase tracking-wide mb-3" style={{ color: colors.textLight }}>
                  Customer Segments
                </h4>
                <div className="flex flex-wrap gap-2">
                  {canvas.customer_segments.map((segment, i) => (
                    <Tag key={i}>{segment}</Tag>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium uppercase tracking-wide mb-3" style={{ color: colors.textLight }}>
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
                <h4 className="text-sm font-medium uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: colors.textLight }}>
                  <Package className="w-4 h-4" />
                  Key Resources
                </h4>
                <ul className="space-y-2">
                  {canvas.key_resources.map((resource, i) => (
                    <li key={i} className="flex items-start gap-2" style={{ color: colors.textMuted }}>
                      <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: colors.accentLighter }} />
                      {resource}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: colors.textLight }}>
                  <BarChart3 className="w-4 h-4" />
                  Key Activities
                </h4>
                <ul className="space-y-2">
                  {canvas.key_activities.map((activity, i) => (
                    <li key={i} className="flex items-start gap-2" style={{ color: colors.textMuted }}>
                      <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: colors.accentLighter }} />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: colors.textLight }}>
                  <Handshake className="w-4 h-4" />
                  Key Partnerships
                </h4>
                <ul className="space-y-2">
                  {canvas.key_partnerships.map((partnership, i) => (
                    <li key={i} className="flex items-start gap-2" style={{ color: colors.textMuted }}>
                      <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: colors.accentLighter }} />
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
              <h4 className="text-sm font-medium uppercase tracking-wide mb-3" style={{ color: colors.textLight }}>
                Cost Structure
              </h4>
              <div className="rounded-lg p-4" style={{ backgroundColor: colors.bg }}>
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

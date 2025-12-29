'use client'

import { useState } from 'react'

export type IntegrationProvider = 'stripe' | 'supabase' | 'calcom' | 'vercel' | 'resend' | 'openrouter'
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending'

interface IntegrationButtonProps {
  provider: IntegrationProvider
  status: IntegrationStatus
  onClick?: () => void
}

const INTEGRATION_CONFIG: Record<IntegrationProvider, { label: string; color: string }> = {
  stripe: { label: 'Stripe', color: '#635BFF' },
  supabase: { label: 'Supabase', color: '#3ECF8E' },
  calcom: { label: 'Cal.com', color: '#292929' },
  vercel: { label: 'Deploy', color: '#000000' },
  resend: { label: 'Email', color: '#000000' },
  openrouter: { label: 'AI', color: '#6366F1' },
}

function StripeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
    </svg>
  )
}

function SupabaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.262-11.653c1.093-1.375.113-3.403-1.645-3.403h-9.642z" />
    </svg>
  )
}

function CalcomIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.8a7.2 7.2 0 110 14.4 7.2 7.2 0 010-14.4zm0 2.4a4.8 4.8 0 100 9.6 4.8 4.8 0 000-9.6z" />
    </svg>
  )
}

function VercelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L24 22H0L12 1z" />
    </svg>
  )
}

function ResendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function OpenRouterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  )
}

const ICONS: Record<IntegrationProvider, React.FC<{ className?: string }>> = {
  stripe: StripeIcon,
  supabase: SupabaseIcon,
  calcom: CalcomIcon,
  vercel: VercelIcon,
  resend: ResendIcon,
  openrouter: OpenRouterIcon,
}

export function IntegrationButton({ provider, status, onClick }: IntegrationButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const config = INTEGRATION_CONFIG[provider]
  const Icon = ICONS[provider]

  const statusColor = {
    connected: 'bg-green-500',
    disconnected: 'bg-gray-300',
    error: 'bg-red-500',
    pending: 'bg-yellow-500',
  }[status]

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary hover:bg-accent border border-border transition-all text-xs font-medium text-foreground"
      title={`${config.label} - ${status}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {isHovered && <span className="text-[10px]">{config.label}</span>}
      <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
    </button>
  )
}

interface IntegrationsBarProps {
  integrations?: Partial<Record<IntegrationProvider, IntegrationStatus>>
  onIntegrationClick?: (provider: IntegrationProvider) => void
}

const DEFAULT_INTEGRATIONS: Record<IntegrationProvider, IntegrationStatus> = {
  stripe: 'disconnected',
  supabase: 'disconnected',
  calcom: 'disconnected',
  vercel: 'disconnected',
  resend: 'disconnected',
  openrouter: 'disconnected',
}

export function IntegrationsBar({ integrations = {}, onIntegrationClick }: IntegrationsBarProps) {
  const allIntegrations = { ...DEFAULT_INTEGRATIONS, ...integrations }

  return (
    <div className="flex items-center gap-1">
      {(Object.keys(allIntegrations) as IntegrationProvider[]).map((provider) => (
        <IntegrationButton
          key={provider}
          provider={provider}
          status={allIntegrations[provider]}
          onClick={() => onIntegrationClick?.(provider)}
        />
      ))}
    </div>
  )
}

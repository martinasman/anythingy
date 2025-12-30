'use client'

import { Sparkles, Check, AlertCircle } from 'lucide-react'
import type { SSEEvent } from '@/types'

interface ActivityLogProps {
  events: SSEEvent[]
  businessStatus?: string
}

const AGENT_ICONS: Record<string, typeof Sparkles> = {
  scout: Sparkles,
  strategist: Sparkles,
  artist: Sparkles,
  architect: Sparkles,
  connector: Sparkles,
}

const AGENT_LABELS: Record<string, string> = {
  scout: 'Scout Agent',
  strategist: 'Strategist Agent',
  artist: 'Artist Agent',
  architect: 'Architect Agent',
  connector: 'Connector Agent',
}

export function ActivityLog({ events, businessStatus }: ActivityLogProps) {
  // Group events by agent for cleaner display
  const agentEvents = events.reduce((acc, event) => {
    if (event.agent) {
      if (!acc[event.agent]) {
        acc[event.agent] = []
      }
      acc[event.agent].push(event)
    }
    return acc
  }, {} as Record<string, SSEEvent[]>)

  const getAgentStatus = (agentEvents: SSEEvent[]) => {
    const hasComplete = agentEvents.some((e) => e.type === 'agent_complete')
    const hasError = agentEvents.some((e) => e.type === 'agent_error')
    const hasStart = agentEvents.some((e) => e.type === 'agent_start')

    if (hasError) return 'error'
    if (hasComplete) return 'complete'
    if (hasStart) return 'running'
    return 'pending'
  }

  if (events.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4">
        <Sparkles className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm text-center">
          Activity log will show here once generation starts
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Activity Log
      </h3>

      <div className="space-y-3">
        {/* Agent activity cards */}
        {Object.entries(agentEvents).map(([agent, agentEventList]) => {
          const status = getAgentStatus(agentEventList)
          const Icon = AGENT_ICONS[agent] || Sparkles
          const label = AGENT_LABELS[agent] || agent

          return (
            <div
              key={agent}
              className="p-3 bg-secondary rounded-lg border border-border"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`p-1.5 rounded ${
                    status === 'complete'
                      ? 'bg-emerald-500/20 text-emerald-600'
                      : status === 'error'
                      ? 'bg-red-500/20 text-red-600'
                      : status === 'running'
                      ? 'bg-blue-500/20 text-blue-600'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-foreground flex-1">
                  {label}
                </span>
                {status === 'complete' && (
                  <Check className="w-4 h-4 text-emerald-600" />
                )}
                {status === 'error' && (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                {status === 'running' && (
                  <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {/* Progress messages */}
              <div className="space-y-1">
                {agentEventList
                  .filter((e) => e.type === 'agent_progress')
                  .slice(-3) // Show last 3 progress messages
                  .map((e, i) => (
                    <p
                      key={i}
                      className="text-xs text-muted-foreground pl-8 truncate"
                    >
                      {e.message}
                    </p>
                  ))}
              </div>
            </div>
          )
        })}

        {/* Generation complete message */}
        {events.some((e) => e.type === 'generation_complete') && (
          <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">
                Generation Complete
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

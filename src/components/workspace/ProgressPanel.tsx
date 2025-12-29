'use client'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { SSEEvent } from '@/types'

const AGENTS = [
  { id: 'scout', name: 'Scout', icon: '🔍', description: 'Market research' },
  { id: 'strategist', name: 'Strategist', icon: '📊', description: 'Business model' },
  { id: 'artist', name: 'Artist', icon: '🎨', description: 'Brand identity' },
  { id: 'architect', name: 'Architect', icon: '🏗️', description: 'Website design' },
  { id: 'connector', name: 'Connector', icon: '🔗', description: 'Customer flow' },
]

interface ProgressPanelProps {
  events: SSEEvent[]
  isStreaming: boolean
  currentAgent: string | null
  isComplete: boolean
  error: string | null
}

export function ProgressPanel({
  events,
  isStreaming,
  currentAgent,
  isComplete,
  error,
}: ProgressPanelProps) {
  const getAgentStatus = (agentId: string) => {
    const agentEvents = events.filter((e) => e.agent === agentId)
    const hasComplete = agentEvents.some((e) => e.type === 'agent_complete')
    const hasError = agentEvents.some((e) => e.type === 'agent_error')
    const isActive = currentAgent === agentId

    if (hasError) return 'error'
    if (hasComplete) return 'completed'
    if (isActive) return 'active'
    return 'pending'
  }

  const getLatestProgress = (agentId: string) => {
    const agentEvents = events.filter(
      (e) => e.agent === agentId && e.progress !== undefined
    )
    if (agentEvents.length === 0) return 0
    return agentEvents[agentEvents.length - 1].progress || 0
  }

  const getLatestMessage = (agentId: string) => {
    const agentEvents = events.filter(
      (e) => e.agent === agentId && e.message
    )
    if (agentEvents.length === 0) return null
    return agentEvents[agentEvents.length - 1].message
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <h3 className="font-semibold text-[#4A3F35] mb-4">Generation Progress</h3>

      <div className="space-y-4">
        {AGENTS.map((agent) => {
          const status = getAgentStatus(agent.id)
          const progress = getLatestProgress(agent.id)
          const message = getLatestMessage(agent.id)

          return (
            <div
              key={agent.id}
              className={`p-3 rounded-lg border transition-colors ${
                status === 'completed'
                  ? 'border-green-700/30 bg-green-100/30'
                  : status === 'active'
                  ? 'border-amber-700/30 bg-amber-100/30'
                  : status === 'error'
                  ? 'border-red-700/30 bg-red-100/30'
                  : 'border-[#E8DCC8] bg-[#F5F1E8]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{agent.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#4A3F35] text-sm">
                      {agent.name}
                    </span>
                    <Badge
                      variant={
                        status === 'completed'
                          ? 'default'
                          : status === 'active'
                          ? 'secondary'
                          : status === 'error'
                          ? 'destructive'
                          : 'outline'
                      }
                      className="text-xs"
                    >
                      {status === 'completed' && '✓'}
                      {status === 'active' && 'Running'}
                      {status === 'pending' && 'Pending'}
                      {status === 'error' && 'Error'}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#8B7B6E] mt-0.5">
                    {agent.description}
                  </p>
                </div>
              </div>

              {status === 'active' && (
                <div className="mt-3 space-y-2">
                  <Progress value={progress} className="h-1" />
                  {message && (
                    <p className="text-xs text-[#8B7B6E] truncate">{message}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {isComplete && (
        <div className="mt-6 p-4 bg-green-100/30 border border-green-700/30 rounded-lg text-center">
          <p className="text-green-800 font-medium">Generation Complete!</p>
          <p className="text-[#8B7B6E] text-sm mt-1">
            Your business is ready to explore
          </p>
        </div>
      )}

      {error && !isStreaming && (
        <div className="mt-6 p-4 bg-red-100/30 border border-red-700/30 rounded-lg text-center">
          <p className="text-red-800 font-medium">Generation Failed</p>
          <p className="text-[#8B7B6E] text-sm mt-1">{error}</p>
        </div>
      )}
    </div>
  )
}

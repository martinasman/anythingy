import type { SSEEvent, Business } from '@/types'

export type AgentEventEmitter = (event: SSEEvent) => void

export interface AgentContext {
  business: Business
  previousOutputs: Record<string, unknown>
  emit: AgentEventEmitter
}

export interface AgentResult<T> {
  success: boolean
  data?: T
  error?: string
}

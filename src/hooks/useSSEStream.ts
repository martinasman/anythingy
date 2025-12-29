'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { SSEEvent } from '@/types'

interface UseSSEStreamOptions {
  onEvent?: (event: SSEEvent) => void
  onComplete?: () => void
  onError?: (error: Error) => void
  autoStart?: boolean
}

export function useSSEStream(
  businessId: string | null,
  options: UseSSEStreamOptions = {}
) {
  const [events, setEvents] = useState<SSEEvent[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentAgent, setCurrentAgent] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const startStream = useCallback(() => {
    if (!businessId || eventSourceRef.current) return

    setIsStreaming(true)
    setEvents([])
    setError(null)
    setIsComplete(false)

    const eventSource = new EventSource(`/api/generate/${businessId}/stream`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (e) => {
      try {
        const event: SSEEvent = JSON.parse(e.data)

        setEvents((prev) => [...prev, event])

        if (event.type === 'agent_start') {
          setCurrentAgent(event.agent || null)
        }

        if (event.type === 'agent_complete') {
          // Agent completed, but more may come
        }

        if (event.type === 'generation_complete') {
          setIsStreaming(false)
          setCurrentAgent(null)
          setIsComplete(true)
          eventSource.close()
          eventSourceRef.current = null
          options.onComplete?.()
        }

        if (event.type === 'agent_error') {
          setError(event.message || 'An error occurred')
          if (!event.agent) {
            // Fatal error
            setIsStreaming(false)
            eventSource.close()
            eventSourceRef.current = null
            options.onError?.(new Error(event.message))
          }
        }

        options.onEvent?.(event)
      } catch (err) {
        console.error('Failed to parse SSE event:', err)
      }
    }

    eventSource.onerror = () => {
      setIsStreaming(false)
      setError('Connection lost')
      eventSource.close()
      eventSourceRef.current = null
      options.onError?.(new Error('Stream connection failed'))
    }

    return () => {
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [businessId, options])

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setIsStreaming(false)
    }
  }, [])

  // Auto-start if option is set
  useEffect(() => {
    if (options.autoStart && businessId) {
      startStream()
    }

    return () => {
      stopStream()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.autoStart, businessId])

  // Get completed agents from events
  const completedAgents = events
    .filter((e) => e.type === 'agent_complete')
    .map((e) => e.agent)
    .filter(Boolean) as string[]

  // Get latest progress for current agent
  const currentProgress = events
    .filter((e) => e.agent === currentAgent && e.progress !== undefined)
    .slice(-1)[0]?.progress

  return {
    events,
    isStreaming,
    isComplete,
    currentAgent,
    currentProgress,
    completedAgents,
    error,
    startStream,
    stopStream,
  }
}

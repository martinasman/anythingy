import { NextRequest } from 'next/server'
import { runAgentPipeline } from '@/lib/agents/orchestrator'
import type { SSEEvent } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return new Response('Business ID is required', { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: SSEEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`
        try {
          controller.enqueue(encoder.encode(data))
        } catch (error) {
          // Stream might be closed
          console.error('Failed to emit event:', error)
        }
      }

      try {
        await runAgentPipeline(id, emit)
      } catch (error) {
        emit({
          type: 'agent_error',
          message: error instanceof Error ? error.message : 'Generation failed',
        })
      } finally {
        try {
          controller.close()
        } catch {
          // Stream already closed
        }
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

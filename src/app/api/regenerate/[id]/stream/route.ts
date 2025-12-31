/**
 * Partial Regeneration SSE Stream
 *
 * GET /api/regenerate/[id]/stream?runId=xxx&agents=architect,connector
 *
 * Streams progress of selective agent regeneration
 */

import { NextRequest } from 'next/server'
import { runPartialPipeline } from '@/lib/agents/partial-orchestrator'
import { createAdminClient } from '@/lib/supabase/server'
import { AGENT_ORDER, type AgentName } from '@/lib/dependencies/graph'
import type { SSEEvent } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: businessId } = await params
  const searchParams = request.nextUrl.searchParams
  const runId = searchParams.get('runId')
  const agentsParam = searchParams.get('agents')

  if (!businessId) {
    return new Response('Business ID is required', { status: 400 })
  }

  // Parse agents to run
  let agentsToRun: AgentName[] = []

  if (agentsParam) {
    // Agents specified in query string
    agentsToRun = agentsParam.split(',').filter((a) =>
      AGENT_ORDER.includes(a as AgentName)
    ) as AgentName[]
  } else if (runId) {
    // Get agents from the run record
    const supabase = createAdminClient()
    const { data: runRecord } = await supabase
      .from('agent_runs')
      .select('input')
      .eq('id', runId)
      .single()

    if (runRecord?.input?.agents) {
      agentsToRun = runRecord.input.agents as AgentName[]
    }
  }

  if (agentsToRun.length === 0) {
    // Default to stale fields
    const supabase = createAdminClient()
    const { data: business } = await supabase
      .from('businesses')
      .select('stale_fields')
      .eq('id', businessId)
      .single()

    if (business?.stale_fields && business.stale_fields.length > 0) {
      // Map stale fields to agents
      const { getAgentsToRun } = await import('@/lib/dependencies/graph')
      agentsToRun = getAgentsToRun(business.stale_fields)
    }
  }

  if (agentsToRun.length === 0) {
    return new Response(
      JSON.stringify({ error: 'No agents specified and no stale fields found' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
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

      // Emit initial info
      emit({
        type: 'agent_start',
        agent: 'partial_pipeline',
        message: `Starting partial regeneration with agents: ${agentsToRun.join(', ')}`,
      })

      try {
        // Update run record to running
        if (runId) {
          const supabase = createAdminClient()
          await supabase
            .from('agent_runs')
            .update({ status: 'running' })
            .eq('id', runId)
        }

        await runPartialPipeline(businessId, agentsToRun, emit)

        // Update run record to completed
        if (runId) {
          const supabase = createAdminClient()
          await supabase
            .from('agent_runs')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('id', runId)
        }
      } catch (error) {
        emit({
          type: 'agent_error',
          message: error instanceof Error ? error.message : 'Regeneration failed',
        })

        // Update run record to failed
        if (runId) {
          const supabase = createAdminClient()
          await supabase
            .from('agent_runs')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              error: error instanceof Error ? error.message : 'Unknown error',
            })
            .eq('id', runId)
        }
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

import { createClient } from '@supabase/supabase-js'
import { runScout } from './scout'
import { runStrategist } from './strategist'
import { runArtist } from './artist'
import { runArchitect } from './architect'
import { runConnector } from './connector'
import type { SSEEvent, Business } from '@/types'
import type { AgentEventEmitter } from './types'

// Create admin client for database operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface AgentConfig {
  name: string
  displayName: string
  run: (ctx: { business: Business; previousOutputs: Record<string, unknown>; emit: AgentEventEmitter }) => Promise<Record<string, unknown>>
  outputFields: string[]
}

const AGENTS: AgentConfig[] = [
  {
    name: 'scout',
    displayName: 'Scout',
    run: async (ctx) => ({ market_research: await runScout(ctx) }),
    outputFields: ['market_research'],
  },
  {
    name: 'strategist',
    displayName: 'Strategist',
    run: async (ctx) => {
      const result = await runStrategist(ctx)
      return result as unknown as Record<string, unknown>
    },
    outputFields: ['business_name', 'tagline', 'business_canvas'],
  },
  {
    name: 'artist',
    displayName: 'Artist',
    run: async (ctx) => {
      const result = await runArtist(ctx)
      return result as unknown as Record<string, unknown>
    },
    outputFields: ['brand_colors', 'brand_voice', 'logo_url'],
  },
  {
    name: 'architect',
    displayName: 'Architect',
    run: async (ctx) => {
      const result = await runArchitect(ctx)
      return result as unknown as Record<string, unknown>
    },
    outputFields: ['website_structure'],
  },
  {
    name: 'connector',
    displayName: 'Connector',
    run: async (ctx) => {
      const result = await runConnector(ctx)
      return result as unknown as Record<string, unknown>
    },
    outputFields: ['customer_journey', 'automation_flows'],
  },
]

export async function runAgentPipeline(
  businessId: string,
  emit: (event: SSEEvent) => void
): Promise<void> {
  const outputs: Record<string, unknown> = {}

  try {
    // Get business from database
    const { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()

    if (fetchError || !business) {
      throw new Error('Business not found')
    }

    // Update status to running
    await supabase
      .from('businesses')
      .update({ status: 'running' })
      .eq('id', businessId)

    // Run each agent sequentially
    for (const agent of AGENTS) {
      // Emit agent start
      emit({
        type: 'agent_start',
        agent: agent.name,
        message: `${agent.displayName} is starting...`,
      })

      // Update current agent in database
      await supabase
        .from('businesses')
        .update({ current_agent: agent.name })
        .eq('id', businessId)

      // Log agent run start
      const { data: agentRun } = await supabase
        .from('agent_runs')
        .insert({
          business_id: businessId,
          agent_name: agent.name,
          input: { prompt: business.prompt, previous_outputs: outputs },
          status: 'running',
        })
        .select()
        .single()

      try {
        // Run the agent
        const result = await agent.run({
          business: business as Business,
          previousOutputs: outputs,
          emit,
        })

        // Store outputs for next agent
        for (const field of agent.outputFields) {
          if (result[field] !== undefined) {
            outputs[field] = result[field]
          }
        }

        // Update business with agent outputs
        const updateData: Record<string, unknown> = {}
        for (const field of agent.outputFields) {
          if (result[field] !== undefined) {
            updateData[field] = result[field]
          }
        }

        await supabase
          .from('businesses')
          .update(updateData)
          .eq('id', businessId)

        // Log agent completion
        if (agentRun) {
          await supabase
            .from('agent_runs')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              output: result,
            })
            .eq('id', agentRun.id)
        }

        // Emit agent complete
        emit({
          type: 'agent_complete',
          agent: agent.name,
          message: `${agent.displayName} completed!`,
          data: result,
        })
      } catch (error) {
        // Log agent failure
        if (agentRun) {
          await supabase
            .from('agent_runs')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              error: error instanceof Error ? error.message : 'Unknown error',
            })
            .eq('id', agentRun.id)
        }

        // Emit error and rethrow
        emit({
          type: 'agent_error',
          agent: agent.name,
          message: error instanceof Error ? error.message : 'Agent failed',
        })

        throw error
      }
    }

    // Mark business as complete
    await supabase
      .from('businesses')
      .update({
        status: 'completed',
        current_agent: null,
      })
      .eq('id', businessId)

    // Emit completion
    emit({
      type: 'generation_complete',
      message: 'All agents completed successfully!',
    })
  } catch (error) {
    // Mark business as failed
    await supabase
      .from('businesses')
      .update({
        status: 'failed',
        current_agent: null,
      })
      .eq('id', businessId)

    // Emit final error
    emit({
      type: 'agent_error',
      message: error instanceof Error ? error.message : 'Generation failed',
    })

    throw error
  }
}

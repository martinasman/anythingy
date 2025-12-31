/**
 * Partial Pipeline Orchestrator
 *
 * Runs only specified agents with existing business data as context.
 * Used for selective regeneration when dependencies change.
 */

import { createClient } from '@supabase/supabase-js'
import { runScout } from './scout'
import { runStrategist } from './strategist'
import { runArtist } from './artist'
import { runArchitect } from './architect'
import { runConnector } from './connector'
import { clearStaleness, hashFieldContent } from '@/lib/dependencies'
import { AGENT_OUTPUTS, AGENT_ORDER, type AgentName } from '@/lib/dependencies/graph'
import type { SSEEvent, Business } from '@/types'
import type { AgentEventEmitter } from './types'

// Create admin client for database operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Agent runners mapped by name
const AGENT_RUNNERS: Record<
  AgentName,
  (ctx: {
    business: Business
    previousOutputs: Record<string, unknown>
    emit: AgentEventEmitter
  }) => Promise<Record<string, unknown>>
> = {
  scout: async (ctx) => ({ market_research: await runScout(ctx) }),
  strategist: async (ctx) => {
    const result = await runStrategist(ctx)
    return result as unknown as Record<string, unknown>
  },
  artist: async (ctx) => {
    const result = await runArtist(ctx)
    return result as unknown as Record<string, unknown>
  },
  architect: async (ctx) => {
    const result = await runArchitect(ctx)
    return result as unknown as Record<string, unknown>
  },
  connector: async (ctx) => {
    const result = await runConnector(ctx)
    return result as unknown as Record<string, unknown>
  },
}

// Display names for agents
const AGENT_DISPLAY_NAMES: Record<AgentName, string> = {
  scout: 'Scout',
  strategist: 'Strategist',
  artist: 'Artist',
  architect: 'Architect',
  connector: 'Connector',
}

/**
 * Run a partial pipeline with only specified agents
 * Uses existing business data as context for skipped agents
 */
export async function runPartialPipeline(
  businessId: string,
  agentsToRun: AgentName[],
  emit: (event: SSEEvent) => void
): Promise<void> {
  try {
    // Get current business state
    const { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()

    if (fetchError || !business) {
      throw new Error('Business not found')
    }

    // Build previous outputs from current business state
    const outputs: Record<string, unknown> = {
      market_research: business.market_research,
      business_name: business.business_name,
      tagline: business.tagline,
      business_canvas: business.business_canvas,
      brand_colors: business.brand_colors,
      brand_voice: business.brand_voice,
      logo_url: business.logo_url,
      website_structure: business.website_structure,
      website_code: business.website_code,
      customer_journey: business.customer_journey,
      automation_flows: business.automation_flows,
    }

    // Update status to running
    await supabase
      .from('businesses')
      .update({ status: 'running' })
      .eq('id', businessId)

    // Sort agents to run in correct order
    const sortedAgents = AGENT_ORDER.filter((a) => agentsToRun.includes(a))

    // Run only specified agents
    for (const agentName of sortedAgents) {
      const runner = AGENT_RUNNERS[agentName]
      const displayName = AGENT_DISPLAY_NAMES[agentName]

      // Emit agent start
      emit({
        type: 'agent_start',
        agent: agentName,
        message: `${displayName} is regenerating...`,
      })

      // Update current agent in database
      await supabase
        .from('businesses')
        .update({ current_agent: agentName })
        .eq('id', businessId)

      // Log agent run start
      const { data: agentRun } = await supabase
        .from('agent_runs')
        .insert({
          business_id: businessId,
          agent_name: agentName,
          input: {
            type: 'partial_regeneration',
            previous_outputs: outputs,
          },
          status: 'running',
        })
        .select()
        .single()

      try {
        // Run the agent
        const result = await runner({
          business: business as Business,
          previousOutputs: outputs,
          emit,
        })

        // Get output fields for this agent
        const outputFields = AGENT_OUTPUTS[agentName] || []

        // Store outputs for next agent
        for (const field of outputFields) {
          if (result[field] !== undefined) {
            outputs[field] = result[field]
          }
        }

        // Update business with agent outputs
        const updateData: Record<string, unknown> = {}
        for (const field of outputFields) {
          if (result[field] !== undefined) {
            updateData[field] = result[field]
          }
        }

        await supabase
          .from('businesses')
          .update(updateData)
          .eq('id', businessId)

        // Clear staleness for regenerated fields
        const newHashes: Record<string, string> = {}
        for (const field of outputFields) {
          if (result[field]) {
            newHashes[field] = hashFieldContent(result[field])
          }
        }
        await clearStaleness(businessId, outputFields, newHashes)

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
          agent: agentName,
          message: `${displayName} regenerated!`,
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
          agent: agentName,
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
      message: 'Partial regeneration completed!',
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
      message: error instanceof Error ? error.message : 'Regeneration failed',
    })

    throw error
  }
}

/**
 * Regenerate specific fields by running their agents
 */
export async function regenerateFields(
  businessId: string,
  fields: string[],
  emit: (event: SSEEvent) => void
): Promise<void> {
  // Determine which agents need to run based on fields
  const agentsNeeded = new Set<AgentName>()

  for (const field of fields) {
    for (const [agent, outputs] of Object.entries(AGENT_OUTPUTS)) {
      if (outputs.includes(field as never)) {
        agentsNeeded.add(agent as AgentName)
      }
    }
  }

  await runPartialPipeline(businessId, Array.from(agentsNeeded), emit)
}

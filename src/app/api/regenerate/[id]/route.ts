/**
 * Partial Regeneration API
 *
 * POST /api/regenerate/[id]
 * Body: { fields: ['website_code'] } or { agents: ['architect'] }
 *
 * Triggers selective regeneration of stale fields
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getAgentsToRun, type FieldName, type AgentName } from '@/lib/dependencies/graph'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: businessId } = await params

  if (!businessId) {
    return NextResponse.json(
      { error: 'Business ID is required' },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    const supabase = createAdminClient()

    // Get current business data
    const { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()

    if (fetchError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check if business is already running
    if (business.status === 'running') {
      return NextResponse.json(
        { error: 'Business is already being regenerated' },
        { status: 409 }
      )
    }

    // Determine which agents need to run
    let agentsToRun: AgentName[]

    if (body.agents && Array.isArray(body.agents)) {
      // Explicitly specified agents
      agentsToRun = body.agents as AgentName[]
    } else if (body.fields && Array.isArray(body.fields)) {
      // Calculate agents from fields
      agentsToRun = getAgentsToRun(body.fields as FieldName[])
    } else {
      // Default: regenerate all stale fields
      const staleFields = business.stale_fields || []
      if (staleFields.length === 0) {
        return NextResponse.json({
          message: 'Nothing to regenerate',
          agentsToRun: [],
        })
      }
      agentsToRun = getAgentsToRun(staleFields as FieldName[])
    }

    if (agentsToRun.length === 0) {
      return NextResponse.json({
        message: 'No agents need to run',
        agentsToRun: [],
      })
    }

    // Generate a run ID for tracking
    const runId = crypto.randomUUID()

    // Store partial run info in agent_runs for tracking
    await supabase.from('agent_runs').insert({
      id: runId,
      business_id: businessId,
      agent_name: 'partial_pipeline',
      status: 'pending',
      input: {
        agents: agentsToRun,
        fields: body.fields || null,
        trigger: body.trigger || 'manual',
      },
    })

    return NextResponse.json({
      runId,
      businessId,
      agentsToRun,
      streamUrl: `/api/regenerate/${businessId}/stream?runId=${runId}`,
    })
  } catch (error) {
    console.error('Regeneration error:', error)
    return NextResponse.json(
      { error: 'Failed to start regeneration' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/regenerate/[id]
 * Returns current staleness status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: businessId } = await params

  if (!businessId) {
    return NextResponse.json(
      { error: 'Business ID is required' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // Get business staleness status
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id, status, stale_fields')
    .eq('id', businessId)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // Get detailed field versions
  const { data: fieldVersions } = await supabase
    .from('field_versions')
    .select('*')
    .eq('business_id', businessId)

  return NextResponse.json({
    businessId,
    status: business.status,
    staleFields: business.stale_fields || [],
    fieldVersions: fieldVersions || [],
  })
}

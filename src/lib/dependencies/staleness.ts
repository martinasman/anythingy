/**
 * Staleness Propagation Service
 *
 * Marks downstream fields as stale when dependencies change,
 * and clears staleness when fields are regenerated.
 */

import { createClient } from '@supabase/supabase-js'
import {
  getDownstreamDependents,
  SUBFIELD_DEPENDENCIES,
  type FieldName,
} from './graph'
import {
  analyzeChange,
  hashFieldContent,
  isSignificantChange,
} from './change-detector'

// ============================================================
// SUPABASE CLIENT (Server-side)
// ============================================================

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, key)
}

// ============================================================
// TYPES
// ============================================================

export interface MarkStaleOptions {
  businessId: string
  changedField: string
  changedBy: 'user' | `agent:${string}`
  oldValue?: unknown
  newValue?: unknown
}

export interface MarkStaleResult {
  staleFields: string[]
  affectedSections: string[]
  reason: string
}

export interface FieldVersionInfo {
  field_name: string
  version: number
  is_stale: boolean
  stale_reason: string | null
  stale_since: string | null
  updated_at: string
  content_hash: string | null
}

// ============================================================
// MARK DEPENDENTS STALE
// ============================================================

/**
 * Mark all downstream dependents of a changed field as stale
 * Returns list of fields that were marked stale
 */
export async function markDependentsStale(
  options: MarkStaleOptions
): Promise<MarkStaleResult> {
  const { businessId, changedField, changedBy, oldValue, newValue } = options
  const supabase = getSupabaseAdmin()

  // Analyze the change
  const changeAnalysis = analyzeChange(oldValue, newValue)

  // If no actual change, return early
  if (!changeAnalysis.hasChange) {
    return { staleFields: [], affectedSections: [], reason: 'No change detected' }
  }

  // Check if change is significant
  if (!isSignificantChange(changedField, changeAnalysis.changedSubfields)) {
    return {
      staleFields: [],
      affectedSections: [],
      reason: 'Change not significant enough to trigger updates',
    }
  }

  // Get direct downstream dependents
  const directDependents = getDownstreamDependents(changedField as FieldName)

  // Check for sub-field specific dependencies
  const additionalDependents: FieldName[] = []
  for (const subfield of changeAnalysis.changedSubfields) {
    const key = `${changedField}.${subfield}`
    if (SUBFIELD_DEPENDENCIES[key]) {
      additionalDependents.push(...SUBFIELD_DEPENDENCIES[key])
    }
  }

  // Combine and dedupe
  const allStaleFields = [
    ...new Set([...directDependents, ...additionalDependents]),
  ]

  if (allStaleFields.length === 0) {
    return {
      staleFields: [],
      affectedSections: [],
      reason: 'No downstream dependents found',
    }
  }

  // Build reason string
  const reason =
    changedBy === 'user'
      ? `'${changedField}' was edited by user`
      : `'${changedField}' was updated by ${changedBy}`

  // Use the database function to mark fields stale
  const { error: markError } = await supabase.rpc('mark_fields_stale', {
    p_business_id: businessId,
    p_field_names: allStaleFields,
    p_reason: reason,
  })

  if (markError) {
    console.error('Failed to mark fields stale:', markError)
    // Fallback to manual update
    await manualMarkStale(supabase, businessId, allStaleFields, reason)
  }

  // Update the changed field's version
  await supabase.rpc('increment_field_version', {
    p_business_id: businessId,
    p_field_name: changedField,
    p_content_hash: changeAnalysis.newHash,
  })

  // Calculate affected website sections
  const affectedSections = getAffectedWebsiteSections(
    changedField,
    changeAnalysis.changedSubfields
  )

  return {
    staleFields: allStaleFields,
    affectedSections,
    reason,
  }
}

/**
 * Fallback manual stale marking if RPC fails
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function manualMarkStale(
  supabase: any,
  businessId: string,
  fields: string[],
  reason: string
) {
  const now = new Date().toISOString()

  for (const field of fields) {
    await supabase.from('field_versions').upsert(
      {
        business_id: businessId,
        field_name: field,
        is_stale: true,
        stale_reason: reason,
        stale_since: now,
      },
      { onConflict: 'business_id,field_name' }
    )
  }

  // Update businesses.stale_fields
  await supabase
    .from('businesses')
    .update({ stale_fields: fields })
    .eq('id', businessId)
}

// ============================================================
// CLEAR STALENESS
// ============================================================

/**
 * Clear staleness for regenerated fields
 * Called after an agent successfully regenerates content
 */
export async function clearStaleness(
  businessId: string,
  fields: string[],
  newHashes?: Record<string, string>
): Promise<void> {
  const supabase = getSupabaseAdmin()

  // Use the database function
  const { error } = await supabase.rpc('clear_field_staleness', {
    p_business_id: businessId,
    p_field_names: fields,
  })

  if (error) {
    console.error('Failed to clear staleness:', error)
    // Fallback to manual clear
    await manualClearStaleness(supabase, businessId, fields)
  }

  // Update version and hash for each field
  for (const field of fields) {
    await supabase.rpc('increment_field_version', {
      p_business_id: businessId,
      p_field_name: field,
      p_content_hash: newHashes?.[field] || null,
    })
  }
}

/**
 * Fallback manual staleness clearing
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function manualClearStaleness(
  supabase: any,
  businessId: string,
  fields: string[]
) {
  const now = new Date().toISOString()

  for (const field of fields) {
    await supabase
      .from('field_versions')
      .upsert(
        {
          business_id: businessId,
          field_name: field,
          is_stale: false,
          stale_reason: null,
          stale_since: null,
          updated_at: now,
        },
        { onConflict: 'business_id,field_name' }
      )
  }

  // Recalculate stale_fields on business
  const { data: stillStale } = await supabase
    .from('field_versions')
    .select('field_name')
    .eq('business_id', businessId)
    .eq('is_stale', true)

  await supabase
    .from('businesses')
    .update({
      stale_fields: stillStale?.map((r: { field_name: string }) => r.field_name) || [],
    })
    .eq('id', businessId)
}

// ============================================================
// GET STALENESS INFO
// ============================================================

/**
 * Get staleness information for a business
 * Used by chat to provide context about what's outdated
 */
export async function getStalenessInfo(
  businessId: string
): Promise<FieldVersionInfo[]> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('field_versions')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_stale', true)

  if (error) {
    console.error('Failed to get staleness info:', error)
    return []
  }

  return data || []
}

/**
 * Get all field versions for a business
 */
export async function getFieldVersions(
  businessId: string
): Promise<Record<string, FieldVersionInfo>> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('field_versions')
    .select('*')
    .eq('business_id', businessId)

  if (error) {
    console.error('Failed to get field versions:', error)
    return {}
  }

  const versions: Record<string, FieldVersionInfo> = {}
  for (const row of data || []) {
    versions[row.field_name] = row
  }

  return versions
}

// ============================================================
// AFFECTED SECTIONS HELPER
// ============================================================

import { CHANGE_TO_SECTIONS } from './graph'

/**
 * Get website sections affected by a field change
 */
function getAffectedWebsiteSections(
  field: string,
  changedSubfields: string[]
): string[] {
  const sections = new Set<string>()

  // Check main field
  if (CHANGE_TO_SECTIONS[field]) {
    CHANGE_TO_SECTIONS[field].forEach((s) => sections.add(s))
  }

  // Check sub-fields
  for (const subfield of changedSubfields) {
    const key = `${field}.${subfield}`
    if (CHANGE_TO_SECTIONS[key]) {
      CHANGE_TO_SECTIONS[key].forEach((s) => sections.add(s))
    }
  }

  // If ALL is in the set, return just ALL
  if (sections.has('ALL')) {
    return ['ALL']
  }

  return Array.from(sections)
}

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Initialize field versions for a new business
 * Called after initial generation completes
 */
export async function initializeFieldVersions(
  businessId: string,
  business: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabaseAdmin()
  const fields = [
    'market_research',
    'business_name',
    'tagline',
    'business_canvas',
    'brand_colors',
    'brand_voice',
    'logo_url',
    'website_structure',
    'website_code',
    'customer_journey',
    'automation_flows',
  ]

  for (const field of fields) {
    if (business[field]) {
      const hash = hashFieldContent(business[field])
      await supabase.from('field_versions').upsert(
        {
          business_id: businessId,
          field_name: field,
          version: 1,
          content_hash: hash,
          is_stale: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'business_id,field_name' }
      )
    }
  }
}

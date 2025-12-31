/**
 * Dependency Graph for Business Fields
 *
 * This module defines the relationships between business fields,
 * enabling reactive updates when one field changes.
 *
 * Example: When unfair_advantage changes, website_structure becomes stale.
 */

// ============================================================
// FIELD CONSTANTS
// ============================================================

export const FIELDS = {
  // Input
  PROMPT: 'prompt',

  // Scout Agent Output
  MARKET_RESEARCH: 'market_research',

  // Strategist Agent Output
  BUSINESS_NAME: 'business_name',
  TAGLINE: 'tagline',
  BUSINESS_CANVAS: 'business_canvas',

  // Artist Agent Output
  BRAND_COLORS: 'brand_colors',
  BRAND_VOICE: 'brand_voice',
  LOGO_URL: 'logo_url',

  // Architect Agent Output
  WEBSITE_STRUCTURE: 'website_structure',
  WEBSITE_CODE: 'website_code',

  // Connector Agent Output
  CUSTOMER_JOURNEY: 'customer_journey',
  AUTOMATION_FLOWS: 'automation_flows',
} as const

export type FieldName = (typeof FIELDS)[keyof typeof FIELDS]

// ============================================================
// AGENT TO FIELD MAPPING
// ============================================================

/**
 * Maps each agent to the fields it produces
 */
export const AGENT_OUTPUTS: Record<string, FieldName[]> = {
  scout: ['market_research'],
  strategist: ['business_name', 'tagline', 'business_canvas'],
  artist: ['brand_colors', 'brand_voice', 'logo_url'],
  architect: ['website_structure', 'website_code'],
  connector: ['customer_journey', 'automation_flows'],
}

/**
 * Agent execution order for partial pipeline runs
 */
export const AGENT_ORDER = [
  'scout',
  'strategist',
  'artist',
  'architect',
  'connector',
] as const

export type AgentName = (typeof AGENT_ORDER)[number]

// ============================================================
// FIELD DEPENDENCY GRAPH
// ============================================================

/**
 * Defines what each field depends on (upstream dependencies)
 * Key: field name
 * Value: array of fields that this field depends on
 */
export const FIELD_DEPENDENCIES: Record<FieldName, FieldName[]> = {
  prompt: [],
  market_research: ['prompt'],
  business_name: ['prompt', 'market_research'],
  tagline: ['prompt', 'market_research'],
  business_canvas: ['prompt', 'market_research'],
  brand_colors: ['market_research', 'business_name', 'business_canvas'],
  brand_voice: ['market_research', 'business_name', 'business_canvas'],
  logo_url: ['market_research', 'business_name', 'business_canvas'],
  website_structure: [
    'market_research',
    'business_name',
    'tagline',
    'business_canvas',
    'brand_colors',
    'brand_voice',
  ],
  website_code: ['website_structure', 'brand_colors'],
  customer_journey: [
    'market_research',
    'business_name',
    'business_canvas',
    'website_structure',
  ],
  automation_flows: [
    'market_research',
    'business_name',
    'business_canvas',
    'website_structure',
  ],
}

// ============================================================
// SUB-FIELD DEPENDENCIES (Nested object fields)
// ============================================================

/**
 * Some nested fields have specific downstream effects
 * Key: "parent.child" path
 * Value: fields that depend specifically on this sub-field
 */
export const SUBFIELD_DEPENDENCIES: Record<string, FieldName[]> = {
  // Business canvas sub-fields
  'business_canvas.unfair_advantage': ['website_structure', 'website_code'],
  'business_canvas.value_proposition': [
    'website_structure',
    'website_code',
    'brand_voice',
  ],
  'business_canvas.problem': ['website_structure'],
  'business_canvas.solution': ['website_structure'],
  'business_canvas.customer_segments': [
    'website_structure',
    'customer_journey',
  ],

  // Brand colors sub-fields
  'brand_colors.primary': ['website_code'],
  'brand_colors.secondary': ['website_code'],
  'brand_colors.accent': ['website_code'],
  'brand_colors.background': ['website_code'],
  'brand_colors.text': ['website_code'],
}

// ============================================================
// CHANGE TO SECTION MAPPING (Smart section regeneration)
// ============================================================

/**
 * Maps field changes to specific website sections that need updating
 * Used for smart partial regeneration instead of full website rebuild
 */
export const CHANGE_TO_SECTIONS: Record<string, string[]> = {
  // Business canvas changes → specific sections
  'business_canvas.unfair_advantage': ['hero', 'about'],
  'business_canvas.value_proposition': ['hero', 'features', 'about'],
  'business_canvas.problem': ['hero', 'about'],
  'business_canvas.solution': ['features', 'about'],
  'business_canvas.customer_segments': ['hero', 'testimonials'],

  // Brand changes → styling affects all
  brand_colors: ['ALL'],
  brand_voice: ['hero', 'about', 'cta'],

  // Business identity changes
  business_name: ['hero', 'about', 'footer'],
  tagline: ['hero', 'footer'],
  logo_url: ['hero', 'footer'],

  // Service/product changes
  'offerings.price': ['pricing', 'menu'],
  'offerings.name': ['services', 'menu', 'pricing'],
}

// ============================================================
// DEPENDENCY RESOLUTION FUNCTIONS
// ============================================================

/**
 * Get all downstream fields that would become stale if a field changes
 * Uses transitive closure to find all affected fields
 */
export function getDownstreamDependents(field: FieldName): FieldName[] {
  const dependents: Set<FieldName> = new Set()

  function collect(f: FieldName) {
    for (const [target, deps] of Object.entries(FIELD_DEPENDENCIES)) {
      if (deps.includes(f) && !dependents.has(target as FieldName)) {
        dependents.add(target as FieldName)
        collect(target as FieldName) // Recursive for transitive dependencies
      }
    }
  }

  collect(field)
  return Array.from(dependents)
}

/**
 * Get the agent that produces a specific field
 */
export function getAgentForField(field: FieldName): AgentName | null {
  for (const [agent, outputs] of Object.entries(AGENT_OUTPUTS)) {
    if (outputs.includes(field)) {
      return agent as AgentName
    }
  }
  return null
}

/**
 * Get the minimal set of agents needed to regenerate specific fields
 * Returns agents in correct execution order
 */
export function getAgentsToRun(staleFields: FieldName[]): AgentName[] {
  const agentSet = new Set<AgentName>()

  for (const field of staleFields) {
    const agent = getAgentForField(field)
    if (agent) agentSet.add(agent)
  }

  // Return in pipeline order
  return AGENT_ORDER.filter((a) => agentSet.has(a))
}

/**
 * Get website sections affected by a field change
 * Returns ['ALL'] if the entire website needs regeneration
 */
export function getAffectedSections(
  changedField: string,
  changedSubfields?: string[]
): string[] {
  const sections = new Set<string>()

  // Check main field
  if (CHANGE_TO_SECTIONS[changedField]) {
    CHANGE_TO_SECTIONS[changedField].forEach((s) => sections.add(s))
  }

  // Check sub-fields
  if (changedSubfields) {
    for (const subfield of changedSubfields) {
      const key = `${changedField}.${subfield}`
      if (CHANGE_TO_SECTIONS[key]) {
        CHANGE_TO_SECTIONS[key].forEach((s) => sections.add(s))
      }
    }
  }

  // If 'ALL' is in the set, return just ['ALL']
  if (sections.has('ALL')) {
    return ['ALL']
  }

  return Array.from(sections)
}

/**
 * Get all upstream dependencies for a field (what it needs to be generated)
 */
export function getUpstreamDependencies(field: FieldName): FieldName[] {
  return FIELD_DEPENDENCIES[field] || []
}

/**
 * Check if all dependencies for a field are satisfied (not stale)
 */
export function canRegenerate(
  field: FieldName,
  staleFields: Set<FieldName>
): boolean {
  const deps = getUpstreamDependencies(field)
  return deps.every((dep) => !staleFields.has(dep))
}

// ============================================================
// INTEGRATION DEPENDENCIES (Future: Internal Software)
// ============================================================

/**
 * Extended dependencies for integrations and internal modules
 * Used when CRM, Inventory, Booking etc. are implemented
 */
export const INTEGRATION_DEPENDENCIES: Record<string, FieldName[]> = {
  // External integrations
  'integrations.stripe.status': ['customer_journey', 'automation_flows'],
  'integrations.calcom.status': ['website_structure', 'customer_journey'],

  // Internal modules (future)
  'offerings.*.price': ['website_structure'],
  'offerings.*.name': ['website_structure'],
  'customers.count': [], // Analytics only, doesn't affect other fields
  'bookings.availability': ['website_structure'],

  // CRM → Marketing alignment
  'crm.segments': ['automation_flows', 'customer_journey'],
  'crm.deals.stage': [], // Analytics only
}

/**
 * Get dependencies including integration/module changes
 */
export function getExtendedDependents(path: string): FieldName[] {
  // Check if it's a known field
  if (path in FIELD_DEPENDENCIES) {
    return getDownstreamDependents(path as FieldName)
  }

  // Check integration dependencies
  if (INTEGRATION_DEPENDENCIES[path]) {
    return INTEGRATION_DEPENDENCIES[path]
  }

  // Check for wildcard patterns (e.g., offerings.*.price matches offerings.123.price)
  for (const [pattern, deps] of Object.entries(INTEGRATION_DEPENDENCIES)) {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace('*', '[^.]+') + '$')
      if (regex.test(path)) {
        return deps
      }
    }
  }

  return []
}

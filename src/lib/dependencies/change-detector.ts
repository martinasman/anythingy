/**
 * Change Detection for Business Fields
 *
 * Detects what changed between old and new values,
 * including semantic comparison and sub-field detection.
 */

import crypto from 'crypto'

// ============================================================
// CONTENT HASHING
// ============================================================

/**
 * Generate a hash of field content for comparison
 * Normalizes objects by sorting keys for consistent hashing
 */
export function hashFieldContent(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null'
  }

  const normalized = JSON.stringify(value, (_, v) => {
    // Sort object keys for consistent hashing
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return Object.keys(v)
        .sort()
        .reduce(
          (acc, key) => {
            acc[key] = v[key]
            return acc
          },
          {} as Record<string, unknown>
        )
    }
    return v
  })

  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16)
}

// ============================================================
// SEMANTIC COMPARISON
// ============================================================

/**
 * Compare two values semantically
 * Returns true if there's a meaningful change
 */
export function hasSemanticChange(oldValue: unknown, newValue: unknown): boolean {
  // Null/undefined handling
  if (oldValue === null && newValue === null) return false
  if (oldValue === undefined && newValue === undefined) return false
  if (oldValue === null || oldValue === undefined) return newValue !== null && newValue !== undefined
  if (newValue === null || newValue === undefined) return true

  // Type mismatch = change
  if (typeof oldValue !== typeof newValue) return true

  // String comparison (normalize whitespace)
  if (typeof oldValue === 'string' && typeof newValue === 'string') {
    const normalizedOld = oldValue.trim().toLowerCase()
    const normalizedNew = newValue.trim().toLowerCase()
    return normalizedOld !== normalizedNew
  }

  // Number comparison
  if (typeof oldValue === 'number' && typeof newValue === 'number') {
    return oldValue !== newValue
  }

  // Boolean comparison
  if (typeof oldValue === 'boolean' && typeof newValue === 'boolean') {
    return oldValue !== newValue
  }

  // Array comparison (order matters)
  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    if (oldValue.length !== newValue.length) return true
    for (let i = 0; i < oldValue.length; i++) {
      if (hasSemanticChange(oldValue[i], newValue[i])) return true
    }
    return false
  }

  // Object comparison via hash
  return hashFieldContent(oldValue) !== hashFieldContent(newValue)
}

// ============================================================
// SUB-FIELD CHANGE DETECTION
// ============================================================

/**
 * Detect which specific sub-fields changed in a complex object
 * Returns array of changed keys (e.g., ['unfair_advantage', 'value_proposition'])
 */
export function detectSubfieldChanges(
  oldValue: Record<string, unknown> | null | undefined,
  newValue: Record<string, unknown> | null | undefined
): string[] {
  const changes: string[] = []

  // Handle null/undefined
  if (!oldValue && !newValue) return []
  if (!oldValue || !newValue) {
    // Everything changed if one is null
    return Object.keys(oldValue || newValue || {})
  }

  // Get all keys from both objects
  const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)])

  for (const key of allKeys) {
    if (hasSemanticChange(oldValue[key], newValue[key])) {
      changes.push(key)
    }
  }

  return changes
}

// ============================================================
// CHANGE ANALYSIS
// ============================================================

export interface ChangeAnalysis {
  hasChange: boolean
  changedSubfields: string[]
  oldHash: string
  newHash: string
  changeType: 'created' | 'updated' | 'deleted' | 'unchanged'
}

/**
 * Analyze changes between old and new values
 * Returns detailed change information
 */
export function analyzeChange(
  oldValue: unknown,
  newValue: unknown
): ChangeAnalysis {
  const oldHash = hashFieldContent(oldValue)
  const newHash = hashFieldContent(newValue)
  const hasChange = oldHash !== newHash

  // Determine change type
  let changeType: ChangeAnalysis['changeType'] = 'unchanged'
  if (!oldValue && newValue) {
    changeType = 'created'
  } else if (oldValue && !newValue) {
    changeType = 'deleted'
  } else if (hasChange) {
    changeType = 'updated'
  }

  // Detect sub-field changes for objects
  let changedSubfields: string[] = []
  if (
    typeof oldValue === 'object' &&
    typeof newValue === 'object' &&
    !Array.isArray(oldValue) &&
    !Array.isArray(newValue)
  ) {
    changedSubfields = detectSubfieldChanges(
      oldValue as Record<string, unknown>,
      newValue as Record<string, unknown>
    )
  }

  return {
    hasChange,
    changedSubfields,
    oldHash,
    newHash,
    changeType,
  }
}

// ============================================================
// SIGNIFICANT CHANGE DETECTION
// ============================================================

/**
 * Fields that are considered "significant" - changes to these
 * should always trigger downstream updates
 */
const SIGNIFICANT_SUBFIELDS: Record<string, string[]> = {
  business_canvas: [
    'unfair_advantage',
    'value_proposition',
    'problem',
    'solution',
    'customer_segments',
  ],
  brand_colors: ['primary', 'secondary', 'accent'],
  market_research: ['industry', 'target_audience', 'trends'],
}

/**
 * Check if a change to a field is "significant" enough to trigger updates
 * Minor changes (like typo fixes) might not warrant full regeneration
 */
export function isSignificantChange(
  fieldName: string,
  changedSubfields: string[]
): boolean {
  // If no subfields specified, consider the whole field changed = significant
  if (changedSubfields.length === 0) return true

  // Check if any significant subfields changed
  const significantFields = SIGNIFICANT_SUBFIELDS[fieldName]
  if (!significantFields) return true // Unknown field = assume significant

  return changedSubfields.some((sf) => significantFields.includes(sf))
}

// ============================================================
// BATCH CHANGE DETECTION
// ============================================================

export interface FieldChange {
  field: string
  analysis: ChangeAnalysis
  isSignificant: boolean
}

/**
 * Detect changes across multiple fields at once
 * Useful for comparing entire business objects
 */
export function detectBatchChanges(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
  fieldsToCheck?: string[]
): FieldChange[] {
  const changes: FieldChange[] = []
  const fields = fieldsToCheck || [
    ...new Set([...Object.keys(oldData), ...Object.keys(newData)]),
  ]

  for (const field of fields) {
    const analysis = analyzeChange(oldData[field], newData[field])

    if (analysis.hasChange) {
      changes.push({
        field,
        analysis,
        isSignificant: isSignificantChange(field, analysis.changedSubfields),
      })
    }
  }

  return changes
}

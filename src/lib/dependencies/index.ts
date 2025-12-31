/**
 * Dependencies Module
 *
 * Provides reactive dependency tracking for business fields.
 * When one field changes, dependent fields are marked as stale.
 */

// Graph definitions and resolution
export {
  FIELDS,
  AGENT_OUTPUTS,
  AGENT_ORDER,
  FIELD_DEPENDENCIES,
  SUBFIELD_DEPENDENCIES,
  CHANGE_TO_SECTIONS,
  getDownstreamDependents,
  getAgentForField,
  getAgentsToRun,
  getAffectedSections,
  getUpstreamDependencies,
  canRegenerate,
  getExtendedDependents,
  INTEGRATION_DEPENDENCIES,
  type FieldName,
  type AgentName,
} from './graph'

// Change detection
export {
  hashFieldContent,
  hasSemanticChange,
  detectSubfieldChanges,
  analyzeChange,
  isSignificantChange,
  detectBatchChanges,
  type ChangeAnalysis,
  type FieldChange,
} from './change-detector'

// Staleness management
export {
  markDependentsStale,
  clearStaleness,
  getStalenessInfo,
  getFieldVersions,
  initializeFieldVersions,
  type MarkStaleOptions,
  type MarkStaleResult,
  type FieldVersionInfo,
} from './staleness'

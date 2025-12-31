-- ============================================================
-- FIELD VERSIONS (Track field freshness and staleness)
-- ============================================================
-- This enables the reactive dependency system where changes to
-- one field (e.g., unfair_advantage) can mark dependent fields
-- (e.g., website_structure) as stale.

CREATE TABLE IF NOT EXISTS field_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,

  -- Version tracking
  version INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Content hash for semantic comparison
  content_hash TEXT,

  -- Staleness tracking
  is_stale BOOLEAN DEFAULT false,
  stale_reason TEXT, -- e.g., "Dependency 'brand_colors' was modified"
  stale_since TIMESTAMPTZ,

  -- Dependency info (snapshot at time of generation)
  dependency_versions JSONB, -- {"market_research": 5, "business_name": 3}

  UNIQUE(business_id, field_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_field_versions_business ON field_versions(business_id);
CREATE INDEX IF NOT EXISTS idx_field_versions_stale ON field_versions(business_id, is_stale);
CREATE INDEX IF NOT EXISTS idx_field_versions_field ON field_versions(business_id, field_name);

-- Add stale_fields column to businesses for quick access
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS stale_fields TEXT[] DEFAULT '{}';

-- Enable RLS
ALTER TABLE field_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view field versions for their businesses
CREATE POLICY "Users can view field versions" ON field_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = field_versions.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Policy: Users can manage field versions for their businesses
CREATE POLICY "Users can manage field versions" ON field_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = field_versions.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Add to realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE field_versions;

-- ============================================================
-- HELPER FUNCTION: Increment version
-- ============================================================
CREATE OR REPLACE FUNCTION increment_field_version(
  p_business_id UUID,
  p_field_name TEXT,
  p_content_hash TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_version INTEGER;
BEGIN
  INSERT INTO field_versions (business_id, field_name, version, content_hash, updated_at)
  VALUES (p_business_id, p_field_name, 1, p_content_hash, NOW())
  ON CONFLICT (business_id, field_name)
  DO UPDATE SET
    version = field_versions.version + 1,
    content_hash = COALESCE(p_content_hash, field_versions.content_hash),
    updated_at = NOW(),
    is_stale = false,
    stale_reason = NULL,
    stale_since = NULL
  RETURNING version INTO new_version;

  RETURN new_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HELPER FUNCTION: Mark fields as stale
-- ============================================================
CREATE OR REPLACE FUNCTION mark_fields_stale(
  p_business_id UUID,
  p_field_names TEXT[],
  p_reason TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO field_versions (business_id, field_name, is_stale, stale_reason, stale_since)
  SELECT p_business_id, unnest(p_field_names), true, p_reason, NOW()
  ON CONFLICT (business_id, field_name)
  DO UPDATE SET
    is_stale = true,
    stale_reason = p_reason,
    stale_since = NOW();

  -- Update businesses.stale_fields
  UPDATE businesses
  SET stale_fields = (
    SELECT ARRAY_AGG(DISTINCT field_name)
    FROM field_versions
    WHERE business_id = p_business_id AND is_stale = true
  )
  WHERE id = p_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HELPER FUNCTION: Clear staleness
-- ============================================================
CREATE OR REPLACE FUNCTION clear_field_staleness(
  p_business_id UUID,
  p_field_names TEXT[]
)
RETURNS void AS $$
BEGIN
  UPDATE field_versions
  SET
    is_stale = false,
    stale_reason = NULL,
    stale_since = NULL
  WHERE business_id = p_business_id
  AND field_name = ANY(p_field_names);

  -- Update businesses.stale_fields
  UPDATE businesses
  SET stale_fields = (
    SELECT COALESCE(ARRAY_AGG(DISTINCT field_name), '{}')
    FROM field_versions
    WHERE business_id = p_business_id AND is_stale = true
  )
  WHERE id = p_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

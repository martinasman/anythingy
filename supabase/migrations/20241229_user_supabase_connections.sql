-- User Supabase Connections
-- Allows users to connect their own Supabase project

CREATE TABLE IF NOT EXISTS user_supabase_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Connection details (encrypted)
  supabase_url TEXT NOT NULL,
  supabase_anon_key_encrypted TEXT NOT NULL,
  supabase_service_role_key_encrypted TEXT,

  -- Connection status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'error')),
  last_verified_at TIMESTAMPTZ,
  error_message TEXT,

  -- Schema tracking
  schema_version INTEGER DEFAULT 0,
  last_migration_at TIMESTAMPTZ
);

-- Index for quick user lookups
CREATE INDEX IF NOT EXISTS idx_user_supabase_connections_user ON user_supabase_connections(user_id);

-- RLS
ALTER TABLE user_supabase_connections ENABLE ROW LEVEL SECURITY;

-- Users can only see/manage their own connection
CREATE POLICY "Users can view own supabase connection" ON user_supabase_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create supabase connection" ON user_supabase_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supabase connection" ON user_supabase_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own supabase connection" ON user_supabase_connections
  FOR DELETE USING (auth.uid() = user_id);

-- PART 1: TABLES
-- Run this first after reset-schema.sql

-- ============================================================
-- USERS TABLE (Synced with Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}'
);

-- ============================================================
-- BUSINESSES TABLE (Main entity)
-- ============================================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  prompt TEXT NOT NULL,
  slug TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  current_agent TEXT,

  -- Deployment
  deployed_url TEXT,
  preview_url TEXT,

  -- Scout Agent Output (Market Research)
  market_research JSONB,

  -- Strategist Agent Output (Business Canvas)
  business_name TEXT,
  tagline TEXT,
  business_canvas JSONB,

  -- Artist Agent Output (Brand Identity)
  brand_colors JSONB,
  logo_url TEXT,
  brand_voice TEXT,

  -- Architect Agent Output (Website)
  website_structure JSONB,
  website_code TEXT,

  -- Connector Agent Output (Customer Flow)
  customer_journey JSONB,
  automation_flows JSONB
);

-- ============================================================
-- BUSINESS CONFIG
-- ============================================================
CREATE TABLE IF NOT EXISTS business_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  primary_category TEXT,
  secondary_categories TEXT[],
  confidence_score DECIMAL,
  dimensions JSONB DEFAULT '{}',
  components JSONB DEFAULT '{}',
  website_template TEXT,
  dashboard_config JSONB
);

-- ============================================================
-- OFFERINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('product', 'service', 'subscription', 'package')),
  price INTEGER,
  currency TEXT DEFAULT 'USD',
  billing_period TEXT,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  checkout_url TEXT,
  calcom_event_type_id TEXT,
  booking_url TEXT,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- ============================================================
-- INTEGRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'calcom')),
  account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked', 'error')),
  connected_at TIMESTAMPTZ,
  metadata JSONB,
  UNIQUE(business_id, provider)
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'contact', 'deal', 'customer', 'churned')),
  stripe_customer_id TEXT,
  source TEXT,
  source_details JSONB,
  notes TEXT,
  tags TEXT[],
  custom_fields JSONB,
  total_spent INTEGER DEFAULT 0,
  booking_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  UNIQUE(business_id, email)
);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  source TEXT,
  source_id TEXT,
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded')),
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  subtotal INTEGER,
  tax INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  items JSONB,
  paid_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ
);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  offering_id UUID REFERENCES offerings(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  calcom_booking_uid TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes TEXT,
  cancellation_reason TEXT
);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  event_type TEXT NOT NULL,
  visitor_id TEXT,
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  properties JSONB
);

-- ============================================================
-- WEBHOOK EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMPTZ,
  error TEXT,
  UNIQUE(provider, event_id)
);

-- ============================================================
-- AGENT RUNS
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  input JSONB,
  output JSONB,
  error TEXT
);

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context JSONB
);

-- ============================================================
-- USER SUPABASE CONNECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_supabase_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  supabase_url TEXT NOT NULL,
  supabase_anon_key_encrypted TEXT NOT NULL,
  supabase_service_role_key_encrypted TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'error')),
  last_verified_at TIMESTAMPTZ,
  error_message TEXT,
  schema_version INTEGER DEFAULT 0,
  last_migration_at TIMESTAMPTZ
);

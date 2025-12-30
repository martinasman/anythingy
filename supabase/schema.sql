-- Anything V1 Database Schema (MVP)
-- Run this in the Supabase SQL Editor

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
  website_code TEXT,  -- Generated React/JSX code for WebContainers

  -- Connector Agent Output (Customer Flow)
  customer_journey JSONB,
  automation_flows JSONB
);

-- ============================================================
-- BUSINESS CONFIG (Classification & Component Requirements)
-- ============================================================
CREATE TABLE IF NOT EXISTS business_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Classification (from Classifier agent)
  primary_category TEXT,
  secondary_categories TEXT[],
  confidence_score DECIMAL,
  dimensions JSONB DEFAULT '{
    "industry_vertical": null,
    "product_or_service": null,
    "customer_type": null,
    "revenue_model": null,
    "interaction_model": null,
    "touch_level": null
  }',

  -- Components (from Component Mapper)
  components JSONB DEFAULT '{
    "booking": { "enabled": false, "type": null },
    "inventory": { "enabled": false, "type": null },
    "crm": { "enabled": true, "complexity": "low" },
    "payments": { "enabled": true, "model": null },
    "pos": { "enabled": false },
    "memberships": { "enabled": false },
    "documents": { "enabled": false }
  }',

  -- Template selection
  website_template TEXT,
  dashboard_config JSONB
);

-- ============================================================
-- OFFERINGS (Products, Services, Subscriptions)
-- ============================================================
CREATE TABLE IF NOT EXISTS offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('product', 'service', 'subscription', 'package')),

  -- Pricing
  price INTEGER, -- cents
  currency TEXT DEFAULT 'USD',
  billing_period TEXT, -- 'month', 'year', etc.

  -- Stripe integration
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  checkout_url TEXT,

  -- Cal.com integration (for services)
  calcom_event_type_id TEXT,
  booking_url TEXT,
  duration_minutes INTEGER,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- ============================================================
-- INTEGRATIONS (Stripe, Cal.com connections)
-- ============================================================
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'calcom')),
  account_id TEXT,
  access_token TEXT, -- encrypted
  refresh_token TEXT, -- encrypted

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked', 'error')),
  connected_at TIMESTAMPTZ,
  metadata JSONB,

  UNIQUE(business_id, provider)
);

-- ============================================================
-- CUSTOMERS (End customers of each business)
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,

  -- Status (CRM pipeline)
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'contact', 'deal', 'customer', 'churned')),

  -- External IDs
  stripe_customer_id TEXT,

  -- Source tracking
  source TEXT, -- 'stripe', 'calcom', 'form', 'manual'
  source_details JSONB,

  -- CRM fields
  notes TEXT,
  tags TEXT[],
  custom_fields JSONB,

  -- Metrics
  total_spent INTEGER DEFAULT 0,
  booking_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,

  UNIQUE(business_id, email)
);

-- ============================================================
-- TRANSACTIONS (Income/Expenses)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT, -- 'sales', 'refund', 'subscription', 'supplies', etc.

  amount INTEGER NOT NULL, -- cents
  currency TEXT DEFAULT 'USD',

  description TEXT,

  -- Source tracking
  source TEXT, -- 'stripe', 'manual'
  source_id TEXT, -- payment_intent_id, etc.

  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS (Product purchases)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded')),

  -- Stripe
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,

  -- Totals
  subtotal INTEGER,
  tax INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',

  -- Items snapshot
  items JSONB,

  paid_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ
);

-- ============================================================
-- BOOKINGS (Service appointments)
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  offering_id UUID REFERENCES offerings(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Cal.com
  calcom_booking_uid TEXT,

  -- Schedule
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT,

  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),

  -- Notes
  notes TEXT,
  cancellation_reason TEXT
);

-- ============================================================
-- EVENTS (Analytics tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  event_type TEXT NOT NULL, -- 'page_view', 'cta_click', 'form_submit', etc.
  visitor_id TEXT,

  -- Context
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,

  -- Custom data
  properties JSONB
);

-- ============================================================
-- WEBHOOK EVENTS (Idempotency tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  provider TEXT NOT NULL, -- 'stripe', 'calcom'
  event_id TEXT NOT NULL, -- External event ID
  event_type TEXT NOT NULL,

  payload JSONB,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMPTZ,
  error TEXT,

  UNIQUE(provider, event_id)
);

-- ============================================================
-- AGENT RUNS (Debugging/replay)
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
-- CHAT MESSAGES (Side chat history)
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
-- USER SUPABASE CONNECTIONS (Link user's own Supabase project)
-- ============================================================
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

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_businesses_user ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);

CREATE INDEX IF NOT EXISTS idx_business_config_business ON business_config(business_id);

CREATE INDEX IF NOT EXISTS idx_offerings_business ON offerings(business_id);
CREATE INDEX IF NOT EXISTS idx_offerings_active ON offerings(business_id, is_active);

CREATE INDEX IF NOT EXISTS idx_integrations_business ON integrations(business_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(business_id, provider);

CREATE INDEX IF NOT EXISTS idx_customers_business ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(business_id, email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(business_id, status);

CREATE INDEX IF NOT EXISTS idx_transactions_business ON transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(business_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(business_id, type);

CREATE INDEX IF NOT EXISTS idx_orders_business ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(business_id, status);

CREATE INDEX IF NOT EXISTS idx_bookings_business ON bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_time ON bookings(business_id, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(business_id, status);

CREATE INDEX IF NOT EXISTS idx_events_business ON events(business_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(business_id, event_type);
CREATE INDEX IF NOT EXISTS idx_events_visitor ON events(business_id, visitor_id);

CREATE INDEX IF NOT EXISTS idx_webhook_events_lookup ON webhook_events(provider, event_id);

CREATE INDEX IF NOT EXISTS idx_agent_runs_business ON agent_runs(business_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_business ON chat_messages(business_id);
CREATE INDEX IF NOT EXISTS idx_user_supabase_connections_user ON user_supabase_connections(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_supabase_connections ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Businesses policies
CREATE POLICY "Users can view own businesses" ON businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create businesses" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own businesses" ON businesses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own businesses" ON businesses
  FOR DELETE USING (auth.uid() = user_id);

-- Business config policies
CREATE POLICY "Users can manage business config" ON business_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = business_config.business_id AND businesses.user_id = auth.uid())
  );

-- Offerings policies
CREATE POLICY "Users can manage offerings" ON offerings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = offerings.business_id AND businesses.user_id = auth.uid())
  );

-- Integrations policies
CREATE POLICY "Users can manage integrations" ON integrations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = integrations.business_id AND businesses.user_id = auth.uid())
  );

-- Customers policies
CREATE POLICY "Users can manage customers" ON customers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = customers.business_id AND businesses.user_id = auth.uid())
  );

-- Transactions policies
CREATE POLICY "Users can manage transactions" ON transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = transactions.business_id AND businesses.user_id = auth.uid())
  );

-- Orders policies
CREATE POLICY "Users can manage orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = orders.business_id AND businesses.user_id = auth.uid())
  );

-- Bookings policies
CREATE POLICY "Users can manage bookings" ON bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = bookings.business_id AND businesses.user_id = auth.uid())
  );

-- Events policies (analytics are read-only for users)
CREATE POLICY "Users can view own events" ON events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = events.business_id AND businesses.user_id = auth.uid())
  );

-- Webhook events - service role only (no user policies)

-- Agent runs policies
CREATE POLICY "Users can view agent runs" ON agent_runs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = agent_runs.business_id AND businesses.user_id = auth.uid())
  );

-- Chat messages policies
CREATE POLICY "Users can manage chat messages" ON chat_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = chat_messages.business_id AND businesses.user_id = auth.uid())
  );

-- User Supabase connections policies
CREATE POLICY "Users can view own supabase connection" ON user_supabase_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create supabase connection" ON user_supabase_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supabase connection" ON user_supabase_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own supabase connection" ON user_supabase_connections
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE businesses;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_unique_slug(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
  new_slug TEXT;
  counter INTEGER := 0;
BEGIN
  new_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9]+', '-', 'g'));
  new_slug := regexp_replace(new_slug, '^-|-$', '', 'g');

  WHILE EXISTS (SELECT 1 FROM businesses WHERE slug = new_slug) LOOP
    counter := counter + 1;
    new_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || counter;
  END LOOP;

  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

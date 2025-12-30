-- PART 2: INDEXES, RLS, AND FUNCTIONS
-- Run this after 01-tables.sql

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
-- ENABLE RLS
-- ============================================================
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

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Businesses
CREATE POLICY "Users can view own businesses" ON businesses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create businesses" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own businesses" ON businesses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own businesses" ON businesses
  FOR DELETE USING (auth.uid() = user_id);

-- Business Config
CREATE POLICY "Users can manage business config" ON business_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = business_config.business_id AND businesses.user_id = auth.uid())
  );

-- Offerings
CREATE POLICY "Users can manage offerings" ON offerings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = offerings.business_id AND businesses.user_id = auth.uid())
  );

-- Integrations
CREATE POLICY "Users can manage integrations" ON integrations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = integrations.business_id AND businesses.user_id = auth.uid())
  );

-- Customers
CREATE POLICY "Users can manage customers" ON customers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = customers.business_id AND businesses.user_id = auth.uid())
  );

-- Transactions
CREATE POLICY "Users can manage transactions" ON transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = transactions.business_id AND businesses.user_id = auth.uid())
  );

-- Orders
CREATE POLICY "Users can manage orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = orders.business_id AND businesses.user_id = auth.uid())
  );

-- Bookings
CREATE POLICY "Users can manage bookings" ON bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = bookings.business_id AND businesses.user_id = auth.uid())
  );

-- Events
CREATE POLICY "Users can view own events" ON events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = events.business_id AND businesses.user_id = auth.uid())
  );

-- Agent Runs
CREATE POLICY "Users can view agent runs" ON agent_runs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = agent_runs.business_id AND businesses.user_id = auth.uid())
  );

-- Chat Messages
CREATE POLICY "Users can manage chat messages" ON chat_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = chat_messages.business_id AND businesses.user_id = auth.uid())
  );

-- User Supabase Connections
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

-- Auto-create user profile on signup
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Generate unique slug
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

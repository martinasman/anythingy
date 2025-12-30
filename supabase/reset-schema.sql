-- RESET SCRIPT: Run this first if you have partial schema
-- This drops everything and recreates from scratch

-- ============================================================
-- DROP TRIGGER (safe even if it doesn't exist)
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================================
-- DROP FUNCTIONS
-- ============================================================
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS generate_unique_slug(TEXT);

-- ============================================================
-- DROP TABLES (CASCADE handles policies automatically)
-- ============================================================
DROP TABLE IF EXISTS user_supabase_connections CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS agent_runs CASCADE;
DROP TABLE IF EXISTS webhook_events CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS offerings CASCADE;
DROP TABLE IF EXISTS business_config CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- Done! Now run 01-tables.sql then 02-indexes-rls.sql
-- ============================================================

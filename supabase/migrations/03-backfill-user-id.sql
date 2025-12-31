-- Migration: Backfill user_id for existing businesses without an owner
-- Run this migration BEFORE updating the generate API route to add authentication
--
-- IMPORTANT: Review the results of this migration before running:
-- 1. First, check how many businesses need user_id:
--    SELECT COUNT(*) FROM businesses WHERE user_id IS NULL;
--
-- 2. Then choose ONE of the options below to handle the orphaned records:
--
-- OPTION A: Assign to a specific user (if you know the user UUID)
-- Replace 'YOUR-USER-UUID-HERE' with the actual user UUID
UPDATE businesses
SET user_id = 'YOUR-USER-UUID-HERE'
WHERE user_id IS NULL;

-- OPTION B: Create a system/legacy user and assign all orphaned businesses to it
-- Uncomment and run these lines instead of OPTION A:
--
-- First, check if the system user already exists:
-- SELECT id FROM users WHERE email = 'system@internal.local' LIMIT 1;
--
-- If it doesn't exist, create it:
-- INSERT INTO users (id, email, email_confirmed_at, created_at, updated_at)
-- VALUES (
--   gen_random_uuid(),
--   'system@internal.local',
--   NOW(),
--   NOW(),
--   NOW()
-- )
-- ON CONFLICT (id) DO NOTHING;
--
-- Then assign businesses to the system user:
-- UPDATE businesses
-- SET user_id = (SELECT id FROM users WHERE email = 'system@internal.local' LIMIT 1)
-- WHERE user_id IS NULL;

-- OPTION C: Delete orphaned businesses (if they're test data)
-- Uncomment and run this instead:
-- DELETE FROM businesses WHERE user_id IS NULL;

-- After running one of the options above, verify all businesses have a user_id:
-- SELECT COUNT(*) FROM businesses WHERE user_id IS NULL;
-- This should return 0.

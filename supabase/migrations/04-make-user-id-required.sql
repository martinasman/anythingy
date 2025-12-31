-- Migration: Make user_id NOT NULL to enforce data integrity
-- Run this migration AFTER the backfill migration (03-backfill-user-id.sql)
-- This ensures all new business records must have a user_id
--
-- IMPORTANT: Before running this migration, verify that all existing businesses have user_id:
-- SELECT COUNT(*) FROM businesses WHERE user_id IS NULL;
-- This should return 0. If it returns > 0, run the backfill migration first.

ALTER TABLE businesses
  ALTER COLUMN user_id SET NOT NULL;

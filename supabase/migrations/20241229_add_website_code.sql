-- Add website_code column for storing generated React code
-- Run this migration if you already have the schema deployed

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS website_code TEXT;

COMMENT ON COLUMN businesses.website_code IS 'Generated React/JSX code for WebContainers live preview';

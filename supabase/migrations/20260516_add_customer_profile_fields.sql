-- Add missing customer fields used by the app
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS account_number TEXT;

-- Ensure the customers row includes email when created during signup
-- (the app expects email to be present and the schema defines it as NOT NULL)
-- This migration does not change existing rows with null email values.

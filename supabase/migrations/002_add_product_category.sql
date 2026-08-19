-- Add category column to products table
-- Safe migration: adds nullable column with no default
-- Existing products will have NULL category (shown as "All")
-- Admin can set categories via the admin panel

ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;

-- Add an index for category filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category) WHERE category IS NOT NULL;

-- Add a check constraint for valid categories
-- This ensures data integrity while allowing flexibility
ALTER TABLE products ADD CONSTRAINT products_category_check
  CHECK (category IS NULL OR category IN (
    'spices', 'herbs', 'seasonings', 'blends', 'peppers', 'oils', 'flours', 'other'
  ));

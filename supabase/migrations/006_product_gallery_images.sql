-- Migration 006: Add multiple images support to products
-- Adds a JSONB column to store an array of additional image URLs
-- The primary image_url stays; images[] holds extra gallery images

ALTER TABLE products
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN products.images IS 'Array of additional image URLs for product gallery (JSONB array of strings)';

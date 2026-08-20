
ALTER TABLE products
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN products.images IS 'Array of additional image URLs for product gallery (JSONB array of strings)';

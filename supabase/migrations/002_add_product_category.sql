
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category) WHERE category IS NOT NULL;

ALTER TABLE products ADD CONSTRAINT products_category_check
  CHECK (category IS NULL OR category IN (
    'spices', 'herbs', 'seasonings', 'blends', 'peppers', 'oils', 'flours', 'other'
  ));

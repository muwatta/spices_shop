ALTER TABLE products
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

UPDATE products
SET archived_at = COALESCE(archived_at, NOW())
WHERE status = 'archived';

CREATE INDEX IF NOT EXISTS idx_products_archived_at
  ON products(archived_at)
  WHERE status = 'archived';
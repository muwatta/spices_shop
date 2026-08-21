CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL CHECK (char_length(comment) BETWEEN 10 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, customer_id)
);

CREATE INDEX IF NOT EXISTS product_reviews_product_id_idx ON product_reviews(product_id, created_at DESC);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published reviews are public" ON product_reviews;
CREATE POLICY "Published reviews are public" ON product_reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Customers can create their reviews" ON product_reviews;
CREATE POLICY "Customers can create their reviews" ON product_reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can edit their reviews" ON product_reviews;
CREATE POLICY "Customers can edit their reviews" ON product_reviews
  FOR UPDATE USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can delete their reviews" ON product_reviews;
CREATE POLICY "Customers can delete their reviews" ON product_reviews
  FOR DELETE USING (auth.uid() = customer_id);
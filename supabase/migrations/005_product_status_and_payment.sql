
ALTER TABLE products ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';

CREATE TABLE IF NOT EXISTS order_activity (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  action text NOT NULL,
  old_value text,
  new_value text,
  performed_by text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage order activity"
  ON order_activity
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE lower(email) = lower(auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_activity_order_id ON order_activity(order_id);

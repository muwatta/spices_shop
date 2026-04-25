
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, 
  image_url TEXT,
  stock INTEGER DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  payment_method TEXT NOT NULL
    CHECK (payment_method IN ('bank_transfer', 'cash_on_delivery')),
  payment_proof_url TEXT,
  total_amount INTEGER NOT NULL,
  notes TEXT,
  delivery_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  ip TEXT,
  user_agent TEXT,
  action TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS do_you_know_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subtitle TEXT,
  benefits TEXT,
  recommendation TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER do_you_know_items_updated_at
  BEFORE UPDATE ON do_you_know_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE do_you_know_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (true);

CREATE POLICY "products_service_write" ON products
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "customers_own_profile" ON customers
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "orders_own" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "orders_service_all" ON orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "order_items_own" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id
        AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "order_items_insert_own" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id
        AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "order_items_service_all" ON order_items
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "admin_settings_public_read" ON admin_settings
  FOR SELECT USING (true);

CREATE POLICY "admin_settings_service_write" ON admin_settings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "do_you_know_items_public_read" ON do_you_know_items
  FOR SELECT USING (true);

CREATE POLICY "do_you_know_items_service_write" ON do_you_know_items
  FOR ALL USING (auth.role() = 'service_role');


ALTER PUBLICATION supabase_realtime ADD TABLE orders;


INSERT INTO admin_settings (key, value) VALUES
  ('bank_details', '{"bank_name": "Moniepoint", "account_number": "8032423638", "account_name": "Hamza Rasheedah Muhammad"}'),
  ('whatsapp_number', '"2347016186356"'),
  ('shop_name', '"KMA Spices and Herbs"'),
  ('delivery_fee', '500')
ON CONFLICT (key) DO NOTHING;

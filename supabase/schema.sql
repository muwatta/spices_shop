-- ============================================================
-- Spice Shop Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in Naira (kobo-free for simplicity)
  image_url TEXT,
  stock INTEGER DEFAULT NULL, -- NULL means unlimited
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
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

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL
);

-- Admin settings (WhatsApp number, bank details, etc.)
CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
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

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Products: anyone can read
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (true);

-- Products: only service role can write (admin uses service role via API)
CREATE POLICY "products_service_write" ON products
  FOR ALL USING (auth.role() = 'service_role');

-- Customers: can read/write own profile
CREATE POLICY "customers_own_profile" ON customers
  FOR ALL USING (auth.uid() = id);

-- Orders: customers can see their own orders
CREATE POLICY "orders_own" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

-- Orders: customers can insert their own orders
CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Orders: service role full access
CREATE POLICY "orders_service_all" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- Order items: customers can see items in their orders
CREATE POLICY "order_items_own" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id
        AND orders.customer_id = auth.uid()
    )
  );

-- Order items: customers can insert items linked to their orders
CREATE POLICY "order_items_insert_own" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id
        AND orders.customer_id = auth.uid()
    )
  );

-- Order items: service role full access
CREATE POLICY "order_items_service_all" ON order_items
  FOR ALL USING (auth.role() = 'service_role');

-- Admin settings: public read (for bank details, WhatsApp)
CREATE POLICY "admin_settings_public_read" ON admin_settings
  FOR SELECT USING (true);

-- Admin settings: service role write
CREATE POLICY "admin_settings_service_write" ON admin_settings
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- Enable Realtime for orders (admin dashboard)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- ============================================================
-- Storage bucket for product images and payment proofs
-- ============================================================
-- Run in Supabase Dashboard > Storage > Create bucket:
-- Name: "product-images", Public: true
-- Name: "payment-proofs", Public: false

-- ============================================================
-- Seed default admin settings
-- ============================================================
INSERT INTO admin_settings (key, value) VALUES
  ('bank_details', '{"bank_name": "Your Bank", "account_number": "1234567890", "account_name": "Your Business Name"}'),
  ('whatsapp_number', '"2348012345678"'),
  ('shop_name', '"Mama Spice Store"'),
  ('delivery_fee', '500')
ON CONFLICT (key) DO NOTHING;

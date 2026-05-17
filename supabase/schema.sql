-- ============================================================
-- Spice Shop Database Schema
-- Run this in Supabase SQL Editor to recreate the database
-- ============================================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, 
  image_url TEXT,
  stock INTEGER DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  account_number TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE,
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

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table (for admin authentication)
CREATE TABLE IF NOT EXISTS admin_users (
  email TEXT PRIMARY KEY,
  is_superadmin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin security events table (for logging unauthorized attempts)
CREATE TABLE IF NOT EXISTS admin_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  ip TEXT,
  user_agent TEXT,
  action TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Do You Know content table
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

-- Apply triggers
DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS do_you_know_items_updated_at ON do_you_know_items;
CREATE TRIGGER do_you_know_items_updated_at
  BEFORE UPDATE ON do_you_know_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE do_you_know_items ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (true);

CREATE POLICY "products_service_write" ON products
  FOR ALL USING (auth.role() = 'service_role');

-- Customers policies
CREATE POLICY "customers_own_profile" ON customers
  FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "customers_service_all" ON customers
  FOR ALL USING (auth.role() = 'service_role');

-- Orders policies
CREATE POLICY "orders_own" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "orders_service_all" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- Order items policies
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

-- Admin settings policies
CREATE POLICY "admin_settings_public_read" ON admin_settings
  FOR SELECT USING (true);

CREATE POLICY "admin_settings_service_write" ON admin_settings
  FOR ALL USING (auth.role() = 'service_role');

-- Admin users policies
CREATE POLICY "admin_users_authenticated_read" ON admin_users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "admin_users_service_all" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

-- Admin security events policies
CREATE POLICY "admin_security_events_service_all" ON admin_security_events
  FOR ALL USING (auth.role() = 'service_role');

-- Do You Know items policies
CREATE POLICY "do_you_know_items_public_read" ON do_you_know_items
  FOR SELECT USING (true);

CREATE POLICY "do_you_know_items_service_write" ON do_you_know_items
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- Enable Realtime for orders (admin dashboard)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- ============================================================
-- Admin user trigger (auto-add admin to admin_users when added via admin panel)
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_users (email)
  VALUES (NEW.email)
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Customer creation trigger (auto-create customer when auth user signs up)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Helper function to check if current user is admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = auth.email()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================
-- Seed default admin settings
-- ============================================================
INSERT INTO admin_settings (key, value) VALUES
  ('bank_details', '{"bank_name": "Moniepoint", "account_number": "8032423638", "account_name": "Hamza Rasheedah Muhammad"}'),
  ('whatsapp_number', '"2347016186356"'),
  ('shop_name', '"KMA Spices and Herbs"'),
  ('delivery_fee', '500')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- Seed admin users (add your admin emails)
-- ============================================================
INSERT INTO admin_users (email, is_superadmin) VALUES
  ('kmafoods22@gmail.com', true),
  ('abdullahmusliudeen@gmail.com', true)
ON CONFLICT (email) DO UPDATE SET is_superadmin = EXCLUDED.is_superadmin;
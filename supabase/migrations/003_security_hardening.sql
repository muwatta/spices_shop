-- ============================================================
-- Migration 003: Security Hardening
-- ============================================================

-- 1. Restrict admin_settings: only service_role can read bank details
DROP POLICY IF EXISTS admin_settings_public_read ON admin_settings;
CREATE POLICY "admin_settings_service_read" ON admin_settings
  FOR SELECT USING (auth.role() = 'service_role');

-- 2. Add auth.uid() verification to process_checkout
CREATE OR REPLACE FUNCTION process_checkout(
  p_user_id UUID,
  p_full_name TEXT,
  p_phone TEXT,
  p_address_line1 TEXT,
  p_address_line2 TEXT,
  p_city TEXT,
  p_state TEXT,
  p_postal_code TEXT,
  p_account_number TEXT,
  p_payment_method TEXT,
  p_payment_proof_url TEXT,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order_id UUID;
  v_transaction_id TEXT;
  v_total_amount INTEGER := 0;
  v_item JSONB;
  v_product RECORD;
  v_product_id UUID;
  v_quantity INTEGER;
  v_delivery_address TEXT;
  v_result JSONB;
BEGIN
  -- Verify the caller is the claimed user
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'User identity mismatch';
  END IF;

  -- Validate payment method
  IF p_payment_method NOT IN ('cash_on_delivery', 'bank_transfer') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;

  -- Bank transfer requires proof
  IF p_payment_method = 'bank_transfer' AND (p_payment_proof_url IS NULL OR p_payment_proof_url = '') THEN
    RAISE EXCEPTION 'Bank transfer orders require payment proof';
  END IF;

  -- Validate items array
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'No items provided';
  END IF;

  -- Cap items array to prevent abuse
  IF jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'Too many items in order';
  END IF;

  -- Generate collision-resistant transaction ID
  v_transaction_id := 'KMA' || (
    EXTRACT(EPOCH FROM clock_timestamp()) * 1000
  )::BIGINT::TEXT || substr(md5(random()::text), 1, 4);

  -- Upsert customer
  INSERT INTO public.customers (id, full_name, email, phone, address, address_line2, city, state, postal_code, account_number)
  VALUES (
    p_user_id,
    p_full_name,
    COALESCE((SELECT email FROM auth.users WHERE id = p_user_id), ''),
    p_phone,
    p_address_line1,
    p_address_line2,
    p_city,
    p_state,
    NULLIF(p_postal_code, ''),
    NULLIF(p_account_number, '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    address_line2 = EXCLUDED.address_line2,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    postal_code = EXCLUDED.postal_code,
    account_number = EXCLUDED.account_number;

  -- Build delivery address
  v_delivery_address := trim(
    p_address_line1 || ' ' ||
    COALESCE(NULLIF(p_address_line2, '') || ' ', '') ||
    p_city || ', ' || p_state || ' ' || COALESCE(NULLIF(p_postal_code, ''), '')
  );

  -- Create order
  v_order_id := gen_random_uuid();
  INSERT INTO public.orders (id, transaction_id, customer_id, status, payment_method, payment_proof_url, total_amount, delivery_address)
  VALUES (
    v_order_id,
    v_transaction_id,
    p_user_id,
    'pending',
    p_payment_method,
    NULLIF(p_payment_proof_url, ''),
    0,
    v_delivery_address
  );

  -- Process each item: validate product, validate stock, insert order_item, decrement stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;

    -- Validate quantity
    IF v_quantity IS NULL OR v_quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity for product %', v_product_id;
    END IF;

    -- Lock the product row and validate existence + stock
    SELECT id, price, stock INTO v_product
    FROM public.products
    WHERE id = v_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', v_product_id;
    END IF;

    -- Validate stock (NULL stock = unlimited)
    IF v_product.stock IS NOT NULL AND v_product.stock < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_product_id;
    END IF;

    -- Add to total (using server-side price)
    v_total_amount := v_total_amount + (v_product.price * v_quantity);

    -- Insert order item
    INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
    VALUES (v_order_id, v_product_id, v_quantity, v_product.price);

    -- Decrement stock (only for finite stock)
    IF v_product.stock IS NOT NULL THEN
      UPDATE public.products
      SET stock = stock - v_quantity
      WHERE id = v_product_id;
    END IF;
  END LOOP;

  -- Update order total
  UPDATE public.orders
  SET total_amount = v_total_amount
  WHERE id = v_order_id;

  -- Return the created order
  SELECT jsonb_build_object(
    'id', o.id,
    'transaction_id', o.transaction_id,
    'customer_id', o.customer_id,
    'status', o.status,
    'payment_method', o.payment_method,
    'payment_proof_url', o.payment_proof_url,
    'total_amount', o.total_amount,
    'delivery_address', o.delivery_address,
    'created_at', o.created_at,
    'updated_at', o.updated_at
  ) INTO v_result
  FROM public.orders o
  WHERE o.id = v_order_id;

  RETURN v_result;
END;
$$;

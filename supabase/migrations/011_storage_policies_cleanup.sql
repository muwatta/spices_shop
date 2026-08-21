CREATE INDEX IF NOT EXISTS idx_orders_payment_proof_url
  ON orders(payment_proof_url)
  WHERE payment_proof_url IS NOT NULL;

DROP POLICY IF EXISTS "Users upload their payment proofs" ON storage.objects;
CREATE POLICY "Users upload their payment proofs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users read their payment proofs" ON storage.objects;
CREATE POLICY "Users read their payment proofs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

DROP POLICY IF EXISTS "Public product images are readable" ON storage.objects;
CREATE POLICY "Public product images are readable" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('product-images', 'do-you-know-images'));

DROP POLICY IF EXISTS "Admins manage product images" ON storage.objects;
CREATE POLICY "Admins manage product images" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id IN ('product-images', 'do-you-know-images')
    AND EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE lower(email) = lower(auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    bucket_id IN ('product-images', 'do-you-know-images')
    AND EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

CREATE OR REPLACE FUNCTION public.cleanup_orphaned_storage_objects()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage, pg_catalog
AS $$
BEGIN
  DELETE FROM storage.objects AS object
  WHERE object.bucket_id = 'payment-proofs'
    AND object.created_at < now() - interval '180 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.orders
      WHERE public.orders.payment_proof_url = object.name
    );

  DELETE FROM storage.objects AS object
  WHERE object.bucket_id IN ('product-images', 'do-you-know-images')
    AND object.created_at < now() - interval '30 days'
    AND NOT EXISTS (
      SELECT 1
      FROM public.products
      WHERE public.products.image_url LIKE '%' || object.name
         OR EXISTS (
           SELECT 1
           FROM jsonb_array_elements_text(COALESCE(public.products.images, '[]'::jsonb)) AS image(value)
           WHERE image.value LIKE '%' || object.name
         )
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.do_you_know_items
      WHERE public.do_you_know_items.image_url LIKE '%' || object.name
    );
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_orphaned_storage_objects() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_orphaned_storage_objects() TO service_role;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-kma-storage') THEN
      PERFORM cron.schedule('cleanup-kma-storage', '15 3 * * *', 'SELECT public.cleanup_orphaned_storage_objects()');
    END IF;
  END IF;
EXCEPTION WHEN insufficient_privilege THEN
  NULL;
END;
$$;

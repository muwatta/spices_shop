CREATE TABLE IF NOT EXISTS public.user_carts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their cart" ON public.user_carts;
CREATE POLICY "Users can read their cart" ON public.user_carts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their cart" ON public.user_carts;
CREATE POLICY "Users can create their cart" ON public.user_carts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their cart" ON public.user_carts;
CREATE POLICY "Users can update their cart" ON public.user_carts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their cart" ON public.user_carts;
CREATE POLICY "Users can delete their cart" ON public.user_carts
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_carts_updated_at ON public.user_carts(updated_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.user_carts;

DROP TRIGGER IF EXISTS user_carts_updated_at ON public.user_carts;
CREATE TRIGGER user_carts_updated_at
  BEFORE UPDATE ON public.user_carts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

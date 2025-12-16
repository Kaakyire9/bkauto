-- Index to speed up filtering/analytics by order status
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);

-- Audit + soft-delete fields
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_by UUID,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS orders_deleted_at_idx ON public.orders(deleted_at);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);

-- Enable RLS if not already
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Owner can SELECT their non-deleted orders
CREATE POLICY orders_select_own
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Owner can UPDATE pending, non-deleted orders (limit typical fields)
CREATE POLICY orders_update_own_pending
  ON public.orders
  FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL AND status = 'pending');

-- Owner soft-delete only when pending
CREATE POLICY orders_soft_delete_own_pending
  ON public.orders
  FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admin overrides (example: role in JWT or email match)
-- Adjust the USING predicate to your setup (e.g., request.jwt.claims.role = 'admin')
CREATE POLICY orders_admin_all_select
  ON public.orders
  FOR SELECT
  USING (true);

CREATE POLICY orders_admin_all_update
  ON public.orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
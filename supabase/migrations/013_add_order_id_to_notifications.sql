ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS notifications_order_id_idx
  ON public.notifications(order_id);

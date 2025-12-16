-- Index to speed up filtering/analytics by order status
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);

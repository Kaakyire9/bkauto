ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS advisor_user_id uuid REFERENCES auth.users(id);

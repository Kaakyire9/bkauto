-- 006_soft_delete_orders.sql
-- Adds soft delete capability and RLS to allow owners to cancel pending orders

begin;

-- 1) Add deleted_at column if not exists
alter table if exists public.orders
  add column if not exists deleted_at timestamptz;

-- 2) Create partial index to keep queries fast for active orders
create index if not exists orders_active_idx on public.orders (status, created_at)
  where deleted_at is null;

-- 3) Ensure RLS is enabled on orders (skip if already enabled)
alter table public.orders enable row level security;

-- 4) Policy: owners can update their own pending orders to set deleted_at
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'orders_soft_delete_owner_update'
  ) then
    create policy orders_soft_delete_owner_update on public.orders
      for update
      to authenticated
      using (
        user_id = auth.uid() and status = 'pending'
      )
      with check (
        user_id = auth.uid() and status = 'pending'
      );
  end if;
end $$;

-- 5) Optional policy: owners can select only their non-deleted orders
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'orders_owner_select_active'
  ) then
    create policy orders_owner_select_active on public.orders
      for select
      to authenticated
      using (
        user_id = auth.uid() and deleted_at is null
      );
  end if;
end $$;

commit;

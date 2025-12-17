-- 009_prevent_blocked_users_from_orders.sql
-- Prevent users flagged as is_blocked from creating new orders

begin;

-- Ensure RLS is enabled on orders
alter table public.orders enable row level security;

-- Policy: allow inserts only if user is not blocked
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'orders_insert_not_blocked'
  ) then
    create policy orders_insert_not_blocked
    on public.orders
    as permissive
    for insert
    to authenticated
    with check (
      exists (
        select 1
        from public.user_profiles up
        where up.user_id = auth.uid()
          and coalesce(up.is_blocked, false) = false
      )
    );
  end if;
end $$;

commit;

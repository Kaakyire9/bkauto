-- Per-order typing indicator state

create table if not exists public.message_typing (
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_typing boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (order_id, user_id)
);

alter table public.message_typing enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'message_typing'
      and policyname = 'typing_own_row'
  ) then
    create policy typing_own_row
      on public.message_typing
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

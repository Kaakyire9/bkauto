-- 010_create_messages_table.sql
-- Basic messaging between users and admins per order

begin;

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete cascade,
  body text,
  image_url text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

-- Helpful index for per-order threads
create index if not exists messages_order_id_created_at_idx
  on public.messages(order_id, created_at desc);

-- Enable RLS
alter table public.messages enable row level security;

-- Policy: only participants (or admins) can see their messages
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'messages'
      and policyname = 'messages_select_participants_only'
  ) then
    create policy messages_select_participants_only
      on public.messages
      for select
      using (
        sender_id = auth.uid()
        or recipient_id = auth.uid()
      );
  end if;
end $$;

-- Policy: allow inserts for authenticated users (we rely on app to set sender/recipient correctly)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'messages'
      and policyname = 'messages_insert_authenticated'
  ) then
    create policy messages_insert_authenticated
      on public.messages
      for insert
      to authenticated
      with check (sender_id = auth.uid());
  end if;
end $$;

commit;

create table if not exists public.message_reads (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(order_id, user_id)
);

alter table public.message_reads enable row level security;

create policy "Users can see their own message_reads"
  on public.message_reads
  for select
  using (auth.uid() = user_id);

create policy "Users can upsert their own message_reads"
  on public.message_reads
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own message_reads"
  on public.message_reads
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

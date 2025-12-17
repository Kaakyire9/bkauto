-- 008_add_is_blocked_to_user_profiles.sql
-- Adds is_blocked flag so admins can block users from placing new orders

begin;

alter table public.user_profiles
  add column if not exists is_blocked boolean not null default false;

commit;

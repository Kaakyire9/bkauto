-- 007_order_cancel_notification.sql
-- Emits a notification when a pending order is soft-deleted (deleted_at set)

begin;

-- Create function to insert notification on cancel
create or replace function public.fn_notify_order_cancel()
returns trigger
language plpgsql
security definer
as $$
declare
  v_short_id text;
  v_vehicle text;
  v_body text;
begin
  -- Only when setting deleted_at for a previously not-deleted pending order
  if (tg_op = 'UPDATE') and (new.deleted_at is not null) and (old.deleted_at is null) and (old.status = 'pending') then
    v_short_id := upper(substr(new.id::text, 1, 8));
    v_vehicle := trim(coalesce(new.make, '') || ' ' || coalesce(new.model, '') || ' ' || coalesce(new.year::text, ''));
    v_body := 'Your order #' || v_short_id || ' (' || v_vehicle || ') has been cancelled.';

    insert into public.notifications (user_id, title, body, type)
    values (new.user_id, 'Order #' || v_short_id || ' Cancelled', v_body, 'info');
  end if;
  return new;
end;
$$;

-- Create trigger on orders updates
drop trigger if exists trg_orders_cancel_notify on public.orders;
create trigger trg_orders_cancel_notify
after update on public.orders
for each row
execute function public.fn_notify_order_cancel();

commit;

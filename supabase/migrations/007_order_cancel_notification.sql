-- 007_order_cancel_notification.sql
-- Emits a notification when a pending order is soft-deleted (deleted_at set)

begin;

-- Create function to insert notification on cancel
create or replace function public.fn_notify_order_cancel()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Only when setting deleted_at for a previously not-deleted pending order
  if (tg_op = 'UPDATE') and (new.deleted_at is not null) and (old.deleted_at is null) and (old.status = 'pending') then
    insert into public.notifications (user_id, title, body, type)
    values (new.user_id, 'Order Cancelled', 'Your order has been cancelled.', 'info');
  end if;
  return new;
end;
$$;

-- Create trigger on orders updates
create trigger trg_orders_cancel_notify
after update on public.orders
for each row
execute function public.fn_notify_order_cancel();

commit;

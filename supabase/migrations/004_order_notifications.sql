-- Notifications for orders via DB triggers

-- Function: notify on new order (pending)
CREATE OR REPLACE FUNCTION public.notify_order_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, body, type, read, created_at, updated_at)
  VALUES (
    NEW.user_id,
    'Order Received',
    'Your order is pending. We have started processing it.',
    'info',
    FALSE,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: notify on order status change
CREATE OR REPLACE FUNCTION public.notify_order_status_update()
RETURNS TRIGGER AS $$
DECLARE
  msg_title text;
  msg_body text;
  msg_type text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'pending' THEN
      msg_title := 'Order Pending';
      msg_body := 'Your order has been received and is pending.';
      msg_type := 'info';
    ELSIF NEW.status = 'in-progress' THEN
      msg_title := 'Order In Progress';
      msg_body := 'We are now sourcing your vehicle. Stay tuned!';
      msg_type := 'info';
    ELSIF NEW.status = 'completed' THEN
      msg_title := 'Order Completed';
      msg_body := 'Your order has been completed. Thank you!';
      msg_type := 'success';
    ELSE
      msg_title := 'Order Update';
      msg_body := 'Your order status changed.';
      msg_type := 'info';
    END IF;

    INSERT INTO public.notifications (user_id, title, body, type, read, created_at, updated_at)
    VALUES (NEW.user_id, msg_title, msg_body, msg_type, FALSE, NOW(), NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
DROP TRIGGER IF EXISTS trg_notify_order_insert ON public.orders;
CREATE TRIGGER trg_notify_order_insert
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_order_insert();

DROP TRIGGER IF EXISTS trg_notify_order_status_update ON public.orders;
CREATE TRIGGER trg_notify_order_status_update
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_order_status_update();

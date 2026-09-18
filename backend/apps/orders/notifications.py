from django.core.mail import send_mail
from django.conf import settings


def send_order_confirmation(order):
    email = order.customer_email
    if not email:
        return
    items_text = '\n'.join([
        f"- {item.product_name} x{item.quantity} = PKR {item.total_price}"
        for item in order.items.all()
    ])
    message = f"""
Thank you for your order at {settings.SITE_NAME}!

Order Number: {order.order_number}
Status: {order.get_status_display()}
Payment Method: {order.get_payment_method_display()}
Total: PKR {order.total}

Items:
{items_text}

Track your order: {settings.SITE_URL}/track-order?order={order.order_number}
"""
    send_mail(
        subject=f'Order Confirmation - {order.order_number}',
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=True,
    )


def send_admin_new_order_notification(order):
    message = f"""
New order received!

Order Number: {order.order_number}
Customer: {order.customer_email}
Phone: {order.customer_phone}
Total: PKR {order.total}
Payment: {order.get_payment_method_display()}

View in admin: {settings.SITE_URL}/admin/orders/{order.id}
"""
    send_mail(
        subject=f'New Order - {order.order_number}',
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.ADMIN_ORDER_EMAIL],
        fail_silently=True,
    )


def send_order_status_update(order, note=''):
    email = order.customer_email
    if not email:
        return
    message = f"""
Your order status has been updated.

Order Number: {order.order_number}
New Status: {order.get_status_display()}
{f'Tracking Number: {order.tracking_number}' if order.tracking_number else ''}
{f'Note: {note}' if note else ''}

Track your order: {settings.SITE_URL}/track-order?order={order.order_number}
"""
    send_mail(
        subject=f'Order Update - {order.order_number}',
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=True,
    )

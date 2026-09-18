from .models import Cart


def get_or_create_cart(request):
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart

    session_key = request.session.session_key
    if not session_key:
        request.session.create()
        session_key = request.session.session_key

    cart, _ = Cart.objects.get_or_create(session_key=session_key, user=None)
    return cart


def merge_carts(user, session_key):
    if not session_key:
        return
    guest_cart = Cart.objects.filter(session_key=session_key, user=None).first()
    if not guest_cart:
        return
    user_cart, _ = Cart.objects.get_or_create(user=user)
    for item in guest_cart.items.all():
        existing = user_cart.items.filter(
            variant=item.variant, saved_for_later=item.saved_for_later
        ).first()
        if existing:
            existing.quantity += item.quantity
            existing.save()
        else:
            item.cart = user_cart
            item.save()
    guest_cart.delete()

from django.db.models import Q

from .models import Product


def storefront_products():
    """Products visible on the public storefront (active product + active category chain)."""
    return Product.objects.filter(
        is_active=True,
        category__is_active=True,
    ).filter(
        Q(subcategory__isnull=True) | Q(subcategory__is_active=True)
    )

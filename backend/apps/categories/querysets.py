from .models import Category


def storefront_categories():
    """Categories visible on the public storefront."""
    return Category.objects.filter(is_active=True)


def active_subcategory_ids(category):
    return list(category.subcategories.filter(is_active=True).values_list('id', flat=True))

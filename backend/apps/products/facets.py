from django.db.models import Q

from apps.categories.models import Category
from apps.categories.querysets import active_subcategory_ids

from .models import ProductVariant
from .querysets import storefront_products

SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']


def _category_product_ids(category_slug: str):
    if not category_slug:
        return storefront_products().values_list('id', flat=True)
    try:
        cat = Category.objects.get(slug=category_slug, is_active=True)
        ids = [cat.id] + active_subcategory_ids(cat)
        return storefront_products().filter(category_id__in=ids).values_list('id', flat=True)
    except Category.DoesNotExist:
        return storefront_products().none().values_list('id', flat=True)


def _sort_sizes(sizes):
    def sort_key(value):
        upper = value.upper()
        if value.isdigit():
            return (0, int(value))
        if upper in SIZE_ORDER:
            return (1, SIZE_ORDER.index(upper))
        return (2, upper)

    return sorted(sizes, key=sort_key)


def get_product_facets(category_slug: str = ''):
    product_ids = _category_product_ids(category_slug)
    variants = ProductVariant.objects.filter(
        product_id__in=product_ids,
        is_active=True,
    )

    sizes = _sort_sizes({
        s for s in variants.exclude(size='').values_list('size', flat=True).distinct()
    })
    waist_sizes = _sort_sizes({
        s for s in variants.exclude(waist_size='').values_list('waist_size', flat=True).distinct()
    })
    colors = sorted({
        c for c in variants.exclude(color='').values_list('color', flat=True).distinct()
    })
    brands = sorted({
        b for b in storefront_products().filter(id__in=product_ids).exclude(
            brand__isnull=True
        ).values_list('brand__slug', flat=True).distinct()
    })

    return {
        'sizes': sizes,
        'waist_sizes': waist_sizes,
        'colors': colors,
        'brands': brands,
    }

import django_filters
from django.db.models import Q
from .models import Product


class ProductFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(method='filter_category')

    def filter_category(self, queryset, name, value):
        if not value:
            return queryset
        from apps.categories.models import Category
        try:
            cat = Category.objects.get(slug=value, is_active=True)
            ids = [cat.id] + list(
                cat.subcategories.filter(is_active=True).values_list('id', flat=True)
            )
            return queryset.filter(category_id__in=ids)
        except Category.DoesNotExist:
            return queryset.none()
    subcategory = django_filters.CharFilter(field_name='subcategory__slug')
    brand = django_filters.CharFilter(field_name='brand__slug')
    min_price = django_filters.NumberFilter(field_name='base_price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='base_price', lookup_expr='lte')
    color = django_filters.CharFilter(method='filter_variant_attr')
    size = django_filters.CharFilter(method='filter_variant_attr')
    material = django_filters.CharFilter(field_name='material', lookup_expr='icontains')
    gender = django_filters.CharFilter(field_name='gender')
    fabric = django_filters.CharFilter(method='filter_variant_attr')
    sleeve_type = django_filters.CharFilter(method='filter_variant_attr')
    waist_size = django_filters.CharFilter(method='filter_variant_attr')
    length = django_filters.CharFilter(method='filter_variant_attr')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    is_featured = django_filters.BooleanFilter()
    is_new_arrival = django_filters.BooleanFilter()
    is_bestseller = django_filters.BooleanFilter()
    is_trending = django_filters.BooleanFilter()
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = Product
        fields = ['category', 'brand', 'gender', 'material']

    VARIANT_FIELD_MAP = {
        'size': 'size',
        'color': 'color',
        'fabric': 'fabric',
        'sleeve_type': 'sleeve_type',
        'waist_size': 'waist_size',
        'length': 'length',
    }

    def filter_variant_attr(self, queryset, name, value):
        if not value:
            return queryset
        field = self.VARIANT_FIELD_MAP.get(name, name)
        return queryset.filter(
            variants__is_active=True,
            **{f'variants__{field}__iexact': str(value).strip()},
        ).distinct()

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(stock_quantity__gt=0) | Q(variants__stock_quantity__gt=0, variants__is_active=True)
            ).distinct()
        return queryset

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(name__icontains=value) |
            Q(description__icontains=value) |
            Q(brand__name__icontains=value) |
            Q(sku__icontains=value)
        )

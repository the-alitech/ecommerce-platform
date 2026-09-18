from rest_framework import serializers
from .models import Category, FilterDefinition, FilterOption
from .querysets import active_subcategory_ids


class FilterOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FilterOption
        fields = ['id', 'label', 'value', 'display_order']


class FilterDefinitionSerializer(serializers.ModelSerializer):
    options = FilterOptionSerializer(many=True, read_only=True)

    class Meta:
        model = FilterDefinition
        fields = ['id', 'name', 'slug', 'field_type', 'attribute_key',
                  'is_active', 'display_order', 'options']


def _category_product_ids(category):
    return [category.id] + active_subcategory_ids(category)


def _visible_products_for_category(category):
    from apps.products.querysets import storefront_products
    return storefront_products().filter(category_id__in=_category_product_ids(category))


class CategoryListSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'icon',
                  'is_active', 'display_order', 'product_count']

    def get_product_count(self, obj):
        return _visible_products_for_category(obj).count()


class SubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image', 'icon', 'display_order']


class CategoryDetailSerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    filter_definitions = serializers.SerializerMethodField()
    parent = SubcategorySerializer(read_only=True)
    product_count = serializers.SerializerMethodField()
    products = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'icon',
                  'parent', 'subcategories', 'filter_definitions', 'product_count',
                  'products', 'meta_title', 'meta_description', 'is_active', 'display_order']

    def get_subcategories(self, obj):
        subs = obj.subcategories.filter(is_active=True)
        return SubcategorySerializer(subs, many=True).data

    def get_filter_definitions(self, obj):
        defs = obj.filter_definitions.filter(is_active=True).prefetch_related('options')
        return FilterDefinitionSerializer(defs, many=True, context=self.context).data

    def get_product_count(self, obj):
        return _visible_products_for_category(obj).count()

    def get_products(self, obj):
        from apps.products.serializers import ProductListSerializer
        products = _visible_products_for_category(obj).select_related(
            'category', 'brand'
        ).prefetch_related('images', 'variants')[:24]
        return ProductListSerializer(products, many=True, context=self.context).data

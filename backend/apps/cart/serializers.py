from rest_framework import serializers
from .models import Cart, CartItem
from apps.products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='variant.product.name', read_only=True)
    product_slug = serializers.CharField(source='variant.product.slug', read_only=True)
    variant_details = serializers.SerializerMethodField()
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    unit_price = serializers.DecimalField(
        source='variant.effective_price', max_digits=10, decimal_places=2, read_only=True
    )
    in_stock = serializers.BooleanField(source='variant.in_stock', read_only=True)
    stock_quantity = serializers.IntegerField(source='variant.stock_quantity', read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'variant', 'quantity', 'saved_for_later', 'product_name',
                  'product_slug', 'variant_details', 'unit_price', 'line_total',
                  'in_stock', 'stock_quantity', 'primary_image']

    def get_variant_details(self, obj):
        v = obj.variant
        return {
            'color': v.color, 'size': v.size, 'waist_size': v.waist_size,
            'length': v.length, 'sku': v.sku,
        }

    def get_primary_image(self, obj):
        from apps.products.constants import CATEGORY_PLACEHOLDERS, DEFAULT_PLACEHOLDER
        img = obj.variant.product.primary_image
        if img and img.image:
            request = self.context.get('request')
            url = img.image.url
            if request and not url.startswith('http'):
                url = request.build_absolute_uri(url)
            return url
        slug = obj.variant.product.category.slug if obj.variant.product.category_id else ''
        return CATEGORY_PLACEHOLDERS.get(slug, DEFAULT_PLACEHOLDER)


class CartSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    saved_items = serializers.SerializerMethodField()
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'items', 'saved_items', 'subtotal', 'total_items', 'updated_at']

    def get_items(self, obj):
        items = obj.items.filter(saved_for_later=False)
        return CartItemSerializer(items, many=True, context=self.context).data

    def get_saved_items(self, obj):
        items = obj.items.filter(saved_for_later=True)
        return CartItemSerializer(items, many=True, context=self.context).data

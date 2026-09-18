from rest_framework import serializers
from .models import Product, ProductVariant, ProductImage, Brand, Wishlist
from .constants import CATEGORY_PLACEHOLDERS, DEFAULT_PLACEHOLDER
from .color_utils import resolve_color_hex


def get_placeholder_url(product):
    slug = product.category.slug if product.category_id else ''
    return CATEGORY_PLACEHOLDERS.get(slug, DEFAULT_PLACEHOLDER)


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'display_order', 'variant']


class ProductVariantSerializer(serializers.ModelSerializer):
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = ['id', 'sku', 'color', 'color_hex', 'size', 'waist_size', 'length',
                  'sleeve_type', 'fabric', 'price', 'effective_price', 'stock_quantity',
                  'attributes', 'is_active', 'in_stock', 'image']

    def _image_url(self, img):
        if not img or not img.image:
            return None
        request = self.context.get('request')
        url = img.image.url
        if request and url and not url.startswith('http'):
            url = request.build_absolute_uri(url)
        return url

    def get_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if url := self._image_url(img):
            return url
        color = (obj.color or '').strip().lower()
        if color:
            for product_img in obj.product.images.all():
                path = (product_img.image.name or '').lower()
                alt = (product_img.alt_text or '').lower()
                if color in path or color in alt:
                    if url := self._image_url(product_img):
                        return url
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        resolved = resolve_color_hex(instance.color, instance.color_hex)
        if resolved:
            data['color_hex'] = resolved
        return data


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo']


class ProductListSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'short_description', 'base_price', 'compare_price',
                  'brand', 'category_name', 'category_slug', 'primary_image', 'in_stock',
                  'is_featured', 'is_new_arrival', 'is_bestseller', 'is_trending',
                  'discount_percentage', 'sales_count']

    def get_primary_image(self, obj):
        img = obj.primary_image
        if img and img.image:
            request = self.context.get('request')
            url = img.image.url
            if request and not url.startswith('http'):
                url = request.build_absolute_uri(url)
            return {'id': img.id, 'url': url, 'alt_text': img.alt_text or obj.name}
        return {'id': 0, 'url': get_placeholder_url(obj), 'alt_text': obj.name}

    def get_discount_percentage(self, obj):
        if obj.compare_price and obj.compare_price > obj.base_price:
            return int(((obj.compare_price - obj.base_price) / obj.compare_price) * 100)
        return 0


class ProductDetailSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    images = serializers.SerializerMethodField()
    variants = ProductVariantSerializer(many=True, read_only=True)
    category = serializers.SerializerMethodField()
    subcategory = serializers.SerializerMethodField()
    related_products = serializers.SerializerMethodField()
    in_stock = serializers.BooleanField(read_only=True)
    is_wishlisted = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'short_description', 'base_price',
                  'compare_price', 'sku', 'stock_quantity', 'brand', 'category', 'subcategory',
                  'gender', 'material', 'specifications', 'images', 'variants', 'in_stock',
                  'is_featured', 'is_new_arrival', 'is_bestseller', 'is_trending',
                  'meta_title', 'meta_description', 'related_products', 'is_wishlisted',
                  'created_at']

    def get_images(self, obj):
        imgs = list(obj.images.all())
        if imgs:
            result = []
            request = self.context.get('request')
            for img in imgs:
                url = img.image.url
                if request and url and not url.startswith('http'):
                    url = request.build_absolute_uri(url)
                result.append({
                    'id': img.id, 'image': url, 'alt_text': img.alt_text or obj.name,
                    'is_primary': img.is_primary, 'display_order': img.display_order,
                    'variant': img.variant_id,
                })
            return result
        return [{
            'id': 0, 'image': get_placeholder_url(obj), 'alt_text': obj.name,
            'is_primary': True, 'display_order': 0,
        }]

    def get_category(self, obj):
        return {'id': obj.category.id, 'name': obj.category.name, 'slug': obj.category.slug}

    def get_subcategory(self, obj):
        if obj.subcategory:
            return {'id': obj.subcategory.id, 'name': obj.subcategory.name, 'slug': obj.subcategory.slug}
        return None

    def get_related_products(self, obj):
        from .querysets import storefront_products
        related = storefront_products().filter(
            category=obj.category
        ).exclude(id=obj.id)[:8]
        return ProductListSerializer(related, many=True, context=self.context).data

    def get_is_wishlisted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Wishlist.objects.filter(user=request.user, product=obj).exists()
        return False


class WishlistSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'created_at']

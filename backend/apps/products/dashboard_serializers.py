from rest_framework import serializers
from django.utils.text import slugify
from .models import Product, ProductVariant, ProductImage, Brand
from apps.categories.models import Category


class AdminBrandSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'is_active']

    def create(self, validated_data):
        if not validated_data.get('slug'):
            validated_data['slug'] = ''
        return super().create(validated_data)


class AdminCategoryOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'is_active']


class AdminVariantSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, allow_null=True)
    sku = serializers.CharField(required=False, allow_blank=True, max_length=50)

    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'color', 'color_hex', 'size', 'waist_size', 'length',
            'sleeve_type', 'fabric', 'price', 'stock_quantity', 'is_active',
        ]
        extra_kwargs = {
            'price': {'required': False, 'allow_null': True},
        }


class AdminProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'url', 'alt_text', 'is_primary', 'display_order', 'variant']

    def get_url(self, obj):
        if not obj.image:
            return ''
        request = self.context.get('request')
        url = obj.image.url
        if request and not url.startswith('http'):
            return request.build_absolute_uri(url)
        return url


class AdminProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, default='')
    primary_image = serializers.SerializerMethodField()
    variant_count = serializers.SerializerMethodField()
    total_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'base_price', 'compare_price',
            'category', 'category_name', 'brand', 'brand_name',
            'is_active', 'is_featured', 'is_new_arrival', 'is_bestseller', 'is_trending',
            'primary_image', 'variant_count', 'total_stock', 'sales_count', 'created_at',
        ]

    def get_primary_image(self, obj):
        img = obj.primary_image
        if not img or not img.image:
            return ''
        request = self.context.get('request')
        url = img.image.url
        if request and not url.startswith('http'):
            return request.build_absolute_uri(url)
        return url

    def get_variant_count(self, obj):
        return obj.variants.count()

    def get_total_stock(self, obj):
        if obj.variants.exists():
            return sum(v.stock_quantity for v in obj.variants.all())
        return obj.stock_quantity


class AdminProductDetailSerializer(serializers.ModelSerializer):
    variants = AdminVariantSerializer(many=True, required=False)
    images = AdminProductImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, default='')
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'description', 'short_description',
            'base_price', 'compare_price', 'stock_quantity',
            'category', 'category_name', 'subcategory', 'brand', 'brand_name',
            'gender', 'material', 'specifications',
            'is_active', 'is_featured', 'is_new_arrival', 'is_bestseller', 'is_trending',
            'meta_title', 'meta_description',
            'variants', 'images', 'sales_count', 'views_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['sales_count', 'views_count', 'created_at', 'updated_at']
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
            'brand': {'required': False, 'allow_null': True},
            'subcategory': {'required': False, 'allow_null': True},
            'compare_price': {'required': False, 'allow_null': True},
        }

    def validate_sku(self, value):
        qs = Product.objects.filter(sku=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('SKU already exists.')
        return value

    def _unique_variant_sku(self, sku, product=None, variant_id=None):
        qs = ProductVariant.objects.filter(sku=sku)
        if variant_id:
            qs = qs.exclude(pk=variant_id)
        if qs.exists():
            raise serializers.ValidationError({'variants': f'Variant SKU already exists: {sku}'})

    def create(self, validated_data):
        variants_data = validated_data.pop('variants', [])
        if not validated_data.get('slug'):
            validated_data['slug'] = ''
        product = Product(**validated_data)
        product.save()  # slug auto-generated in model.save

        for index, vdata in enumerate(variants_data):
            vdata = dict(vdata)
            vdata.pop('id', None)
            sku = (vdata.get('sku') or '').strip() or f"{product.sku}-V{index + 1:02d}"
            self._unique_variant_sku(sku)
            vdata['sku'] = sku
            ProductVariant.objects.create(product=product, **vdata)
        return product

    def update(self, instance, validated_data):
        variants_data = validated_data.pop('variants', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if not instance.slug:
            instance.slug = slugify(instance.name)
        instance.save()

        if variants_data is not None:
            keep_ids = []
            for index, vdata in enumerate(variants_data):
                vdata = dict(vdata)
                variant_id = vdata.pop('id', None)
                sku = vdata.get('sku') or f"{instance.sku}-V{index + 1:02d}"
                vdata['sku'] = sku
                if variant_id:
                    try:
                        variant = instance.variants.get(pk=variant_id)
                    except ProductVariant.DoesNotExist:
                        variant = None
                    if variant:
                        self._unique_variant_sku(sku, variant_id=variant_id)
                        for attr, value in vdata.items():
                            setattr(variant, attr, value)
                        variant.save()
                        keep_ids.append(variant.id)
                        continue
                self._unique_variant_sku(sku)
                variant = ProductVariant.objects.create(product=instance, **vdata)
                keep_ids.append(variant.id)
            instance.variants.exclude(id__in=keep_ids).delete()

        return instance

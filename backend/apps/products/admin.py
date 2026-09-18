from django.contrib import admin
from .models import Product, ProductVariant, ProductImage, Brand, Wishlist


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'variant', 'alt_text', 'is_primary', 'display_order']


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ['sku', 'color', 'size', 'waist_size', 'length', 'sleeve_type',
              'fabric', 'price', 'stock_quantity', 'is_active']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'category', 'brand', 'base_price', 'stock_quantity',
                    'is_active', 'is_featured', 'sales_count']
    list_filter = ['is_active', 'is_featured', 'is_new_arrival', 'is_bestseller',
                   'is_trending', 'category', 'brand', 'gender']
    search_fields = ['name', 'sku', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductVariantInline, ProductImageInline]
    fieldsets = (
        (None, {'fields': ('name', 'slug', 'sku', 'category', 'subcategory', 'brand')}),
        ('Pricing & Stock', {'fields': ('base_price', 'compare_price', 'stock_quantity')}),
        ('Details', {'fields': ('description', 'short_description', 'gender', 'material', 'specifications')}),
        ('Flags', {'fields': ('is_active', 'is_featured', 'is_new_arrival', 'is_bestseller', 'is_trending')}),
        ('SEO', {'fields': ('meta_title', 'meta_description')}),
    )


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']

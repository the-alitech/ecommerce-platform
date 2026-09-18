from django.contrib import admin
from .models import Order, OrderItem, OrderStatusHistory, ShippingRate


@admin.register(ShippingRate)
class ShippingRateAdmin(admin.ModelAdmin):
    list_display = ['city', 'slug', 'charge', 'is_default', 'is_active', 'display_order', 'updated_at']
    list_editable = ['charge', 'is_active', 'display_order']
    list_filter = ['is_active', 'is_default']
    search_fields = ['city', 'slug']
    prepopulated_fields = {'slug': ('city',)}


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'variant_info', 'quantity', 'unit_price', 'total_price']


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ['status', 'note', 'created_at', 'created_by']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'status', 'payment_method', 'total', 'created_at']
    list_filter = ['status', 'payment_method', 'payment_status']
    search_fields = ['order_number', 'guest_email', 'guest_phone', 'tracking_number']
    readonly_fields = ['order_number', 'created_at', 'updated_at']
    inlines = [OrderItemInline, OrderStatusHistoryInline]

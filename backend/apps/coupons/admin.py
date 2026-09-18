from django.contrib import admin
from .models import Coupon


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'value', 'min_order_amount', 'used_count', 'expires_at', 'is_active']
    list_filter = ['discount_type', 'is_active']
    search_fields = ['code']

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Address


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'is_email_verified', 'is_staff', 'date_joined']
    list_filter = ['is_email_verified', 'is_staff', 'is_active']
    search_fields = ['email', 'username', 'first_name', 'last_name', 'phone']
    ordering = ['-date_joined']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Extra', {'fields': ('phone', 'is_email_verified', 'avatar')}),
    )


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'full_name', 'city', 'address_type', 'is_default']
    list_filter = ['address_type', 'is_default']
    search_fields = ['user__email', 'full_name', 'city']

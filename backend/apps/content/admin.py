from django.contrib import admin
from .models import (
    Banner, Testimonial, PageContent, NewsletterSubscriber,
    SiteSettings, PaymentAccount,
)


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'banner_type', 'is_active', 'display_order', 'image_url']
    list_filter = ['banner_type', 'is_active']
    fields = ['title', 'subtitle', 'image', 'image_url', 'link', 'banner_type',
              'display_order', 'is_active', 'starts_at', 'ends_at']


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['name', 'rating', 'is_active', 'display_order']


@admin.register(PageContent)
class PageContentAdmin(admin.ModelAdmin):
    list_display = ['page_type', 'title', 'updated_at']


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ['email', 'is_active', 'subscribed_at']


@admin.register(PaymentAccount)
class PaymentAccountAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'method', 'account_number', 'account_title',
        'is_active', 'display_order',
    ]
    list_filter = ['method', 'is_active']
    list_editable = ['is_active', 'display_order']
    search_fields = ['title', 'account_number', 'account_title', 'bank_name', 'iban']
    fields = [
        'method', 'title', 'account_title', 'account_number',
        'bank_name', 'iban', 'instructions', 'is_active', 'display_order',
    ]


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

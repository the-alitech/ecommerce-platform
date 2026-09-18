from rest_framework import serializers
from .models import (
    Banner, Testimonial, PageContent, NewsletterSubscriber,
    SiteSettings, PaymentAccount,
)


class BannerSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = ['id', 'title', 'subtitle', 'image', 'link', 'banner_type', 'display_order']

    def get_image(self, obj):
        if obj.image_url:
            return obj.image_url
        if obj.image:
            request = self.context.get('request')
            url = obj.image.url
            if request and url and not url.startswith('http'):
                return request.build_absolute_uri(url)
            return url
        return ''


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['id', 'name', 'role', 'content', 'rating', 'image', 'display_order']


class PageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageContent
        fields = ['page_type', 'title', 'content', 'meta_title', 'meta_description']


class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['email']


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = ['site_name', 'tagline', 'logo', 'phone', 'email', 'address',
                  'whatsapp_number', 'facebook_url', 'instagram_url', 'twitter_url',
                  'youtube_url', 'bank_name', 'bank_account', 'bank_iban',
                  'jazzcash_number', 'easypaisa_number', 'google_maps_embed']


class PaymentAccountSerializer(serializers.ModelSerializer):
    method_display = serializers.CharField(source='get_method_display', read_only=True)

    class Meta:
        model = PaymentAccount
        fields = [
            'id', 'method', 'method_display', 'title', 'account_title',
            'account_number', 'bank_name', 'iban', 'instructions',
            'is_active', 'display_order', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

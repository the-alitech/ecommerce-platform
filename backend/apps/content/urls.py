from django.urls import path
from .views import (
    HeroBannersView, PromoBannersView, TestimonialListView,
    PageContentView, NewsletterSubscribeView, SiteSettingsView,
    PaymentAccountListView,
)

urlpatterns = [
    path('banners/hero/', HeroBannersView.as_view(), name='hero_banners'),
    path('banners/promo/', PromoBannersView.as_view(), name='promo_banners'),
    path('testimonials/', TestimonialListView.as_view(), name='testimonials'),
    path('pages/<str:page_type>/', PageContentView.as_view(), name='page_content'),
    path('newsletter/', NewsletterSubscribeView.as_view(), name='newsletter'),
    path('settings/', SiteSettingsView.as_view(), name='site_settings'),
    path('payment-accounts/', PaymentAccountListView.as_view(), name='payment_accounts'),
]

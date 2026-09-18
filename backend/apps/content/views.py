from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q
from .models import (
    Banner, Testimonial, PageContent, NewsletterSubscriber,
    SiteSettings, PaymentAccount,
)
from .serializers import (
    BannerSerializer, TestimonialSerializer, PageContentSerializer,
    NewsletterSerializer, SiteSettingsSerializer, PaymentAccountSerializer,
)


class HeroBannersView(generics.ListAPIView):
    serializer_class = BannerSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        now = timezone.now()
        return Banner.objects.filter(
            is_active=True, banner_type='hero'
        ).filter(
            Q(starts_at__isnull=True) | Q(starts_at__lte=now),
            Q(ends_at__isnull=True) | Q(ends_at__gte=now),
        )


class PromoBannersView(generics.ListAPIView):
    serializer_class = BannerSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Banner.objects.filter(is_active=True, banner_type='promo')


class TestimonialListView(generics.ListAPIView):
    queryset = Testimonial.objects.filter(is_active=True)
    serializer_class = TestimonialSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class PageContentView(generics.RetrieveAPIView):
    serializer_class = PageContentSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'page_type'

    def get_queryset(self):
        return PageContent.objects.all()


class NewsletterSubscribeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = NewsletterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        NewsletterSubscriber.objects.get_or_create(
            email=serializer.validated_data['email']
        )
        return Response({'message': 'Successfully subscribed to newsletter.'},
                        status=status.HTTP_201_CREATED)


class SiteSettingsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        settings = SiteSettings.get_settings()
        return Response(SiteSettingsSerializer(settings).data)


class PaymentAccountListView(generics.ListAPIView):
    """Public checkout endpoint — active payment accounts only."""
    serializer_class = PaymentAccountSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = PaymentAccount.objects.filter(is_active=True)
        method = self.request.query_params.get('method', '').strip()
        if method:
            qs = qs.filter(method=method)
        return qs


class AdminPaymentAccountListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentAccountSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None
    queryset = PaymentAccount.objects.all()


class AdminPaymentAccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PaymentAccountSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = PaymentAccount.objects.all()

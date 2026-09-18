from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Wishlist, Brand
from .querysets import storefront_products
from .serializers import (
    ProductListSerializer, ProductDetailSerializer,
    WishlistSerializer, BrandSerializer,
)
from .filters import ProductFilter
from .facets import get_product_facets


class ProductFacetsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        category = request.query_params.get('category', '')
        return Response(get_product_facets(category))


class ProductListView(generics.ListAPIView):
    queryset = storefront_products().select_related(
        'category', 'brand'
    ).prefetch_related('images', 'variants')
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'brand__name', 'sku']
    ordering_fields = ['base_price', 'created_at', 'sales_count', 'name']
    ordering = ['-created_at']


class ProductDetailView(generics.RetrieveAPIView):
    queryset = storefront_products().select_related(
        'category', 'subcategory', 'brand'
    ).prefetch_related('images', 'variants', 'variants__images')
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Product.objects.filter(pk=instance.pk).update(views_count=instance.views_count + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class UnpaginatedListMixin:
    pagination_class = None


class FeaturedProductsView(UnpaginatedListMixin, generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return storefront_products().filter(is_featured=True)[:12]


class NewArrivalsView(UnpaginatedListMixin, generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = storefront_products().filter(is_new_arrival=True).order_by('-created_at')
        category = self.request.query_params.get('category')
        if category:
            from apps.categories.models import Category
            from apps.categories.querysets import active_subcategory_ids
            try:
                cat = Category.objects.get(slug=category, is_active=True)
                ids = [cat.id] + active_subcategory_ids(cat)
                qs = qs.filter(category_id__in=ids)
            except Category.DoesNotExist:
                return qs.none()
        return qs[:12]


class BestSellersView(UnpaginatedListMixin, generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return storefront_products().filter(is_bestseller=True).order_by('-sales_count')[:12]


class TrendingProductsView(UnpaginatedListMixin, generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return storefront_products().filter(is_trending=True)[:12]


class BrandListView(generics.ListAPIView):
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]


class WishlistListCreateView(generics.ListCreateAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        visible_ids = storefront_products().values_list('id', flat=True)
        return Wishlist.objects.filter(
            user=self.request.user, product_id__in=visible_ids
        ).select_related(
            'product', 'product__brand', 'product__category'
        ).prefetch_related('product__images')

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not storefront_products().filter(pk=product_id).exists():
            return Response({'error': 'Product is not available.'}, status=status.HTTP_404_NOT_FOUND)
        wishlist, created = Wishlist.objects.get_or_create(
            user=request.user, product_id=product_id
        )
        if not created:
            return Response({'message': 'Already in wishlist.'})
        serializer = self.get_serializer(wishlist)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class WishlistDestroyView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        product_id = kwargs.get('product_id')
        deleted, _ = Wishlist.objects.filter(user=request.user, product_id=product_id).delete()
        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'error': 'Not in wishlist.'}, status=status.HTTP_404_NOT_FOUND)


class WishlistToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, product_id):
        if not storefront_products().filter(pk=product_id).exists():
            return Response({'error': 'Product is not available.'}, status=status.HTTP_404_NOT_FOUND)
        wishlist = Wishlist.objects.filter(user=request.user, product_id=product_id)
        if wishlist.exists():
            wishlist.delete()
            return Response({'wishlisted': False})
        Wishlist.objects.create(user=request.user, product_id=product_id)
        return Response({'wishlisted': True})

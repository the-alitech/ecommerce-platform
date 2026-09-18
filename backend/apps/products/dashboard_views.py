from rest_framework import generics, permissions, status, filters
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from apps.categories.models import Category
from .models import Product, ProductImage, Brand
from .dashboard_serializers import (
    AdminProductListSerializer,
    AdminProductDetailSerializer,
    AdminProductImageSerializer,
    AdminBrandSerializer,
    AdminCategoryOptionSerializer,
)


class IsStaffUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff


class AdminProductOptionsView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        categories = Category.objects.filter(is_active=True).order_by('display_order', 'name')
        brands = Brand.objects.filter(is_active=True).order_by('name')
        return Response({
            'categories': AdminCategoryOptionSerializer(categories, many=True).data,
            'brands': AdminBrandSerializer(brands, many=True).data,
            'genders': [
                {'value': 'men', 'label': 'Men'},
                {'value': 'women', 'label': 'Women'},
                {'value': 'unisex', 'label': 'Unisex'},
                {'value': 'kids', 'label': 'Kids'},
            ],
        })


class AdminBrandListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminBrandSerializer
    pagination_class = None
    queryset = Brand.objects.all().order_by('name')


class AdminProductListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsStaffUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'is_active', 'is_featured', 'gender']
    search_fields = ['name', 'sku', 'description']
    ordering_fields = ['created_at', 'base_price', 'name', 'sales_count']
    ordering = ['-created_at']

    def get_queryset(self):
        return Product.objects.select_related('category', 'brand').prefetch_related(
            'images', 'variants'
        )

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AdminProductDetailSerializer
        return AdminProductListSerializer


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminProductDetailSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        return Product.objects.select_related('category', 'brand', 'subcategory').prefetch_related(
            'images', 'variants', 'images__variant'
        )


class AdminProductImageUploadView(APIView):
    permission_classes = [IsStaffUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'image file is required.'}, status=status.HTTP_400_BAD_REQUEST)

        is_primary = str(request.data.get('is_primary', '')).lower() in ('1', 'true', 'yes')
        alt_text = request.data.get('alt_text', '') or product.name
        display_order = int(request.data.get('display_order') or product.images.count())
        variant_id = request.data.get('variant') or None

        if is_primary:
            product.images.filter(is_primary=True).update(is_primary=False)

        img = ProductImage(
            product=product,
            alt_text=alt_text,
            is_primary=is_primary or not product.images.exists(),
            display_order=display_order,
        )
        if variant_id:
            img.variant_id = int(variant_id)
        img.image = image_file
        img.save()

        return Response(
            AdminProductImageSerializer(img, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class AdminProductImageDetailView(generics.DestroyAPIView):
    permission_classes = [IsStaffUser]
    queryset = ProductImage.objects.all()

    def perform_destroy(self, instance):
        was_primary = instance.is_primary
        product = instance.product
        instance.image.delete(save=False)
        instance.delete()
        if was_primary:
            next_img = product.images.first()
            if next_img:
                next_img.is_primary = True
                next_img.save(update_fields=['is_primary'])

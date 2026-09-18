from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category
from .querysets import storefront_categories
from .serializers import CategoryListSerializer, CategoryDetailSerializer


class CategoryListView(generics.ListAPIView):
    queryset = storefront_categories().filter(parent__isnull=True)
    serializer_class = CategoryListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class CategoryDetailView(generics.RetrieveAPIView):
    queryset = storefront_categories()
    serializer_class = CategoryDetailSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]


class SubcategoryListView(generics.ListAPIView):
    serializer_class = CategoryListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        parent_slug = self.kwargs['parent_slug']
        return storefront_categories().filter(
            parent__slug=parent_slug, parent__is_active=True
        )

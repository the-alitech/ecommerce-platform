from django.urls import path
from .views import (
    ProductListView, ProductDetailView, FeaturedProductsView,
    NewArrivalsView, BestSellersView, TrendingProductsView,
    BrandListView, WishlistListCreateView, WishlistDestroyView, WishlistToggleView,
    ProductFacetsView,
)

urlpatterns = [
    path('', ProductListView.as_view(), name='product_list'),
    path('facets/', ProductFacetsView.as_view(), name='product_facets'),
    path('featured/', FeaturedProductsView.as_view(), name='featured_products'),
    path('new-arrivals/', NewArrivalsView.as_view(), name='new_arrivals'),
    path('best-sellers/', BestSellersView.as_view(), name='best_sellers'),
    path('trending/', TrendingProductsView.as_view(), name='trending_products'),
    path('brands/', BrandListView.as_view(), name='brand_list'),
    path('wishlist/', WishlistListCreateView.as_view(), name='wishlist'),
    path('wishlist/<int:product_id>/', WishlistDestroyView.as_view(), name='wishlist_remove'),
    path('wishlist/toggle/<int:product_id>/', WishlistToggleView.as_view(), name='wishlist_toggle'),
    path('<slug:slug>/', ProductDetailView.as_view(), name='product_detail'),
]

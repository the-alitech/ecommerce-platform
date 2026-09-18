from django.urls import path
from .dashboard_views import (
    DashboardStatsView, AdminOrderListView, AdminOrderDetailView,
    ExportOrdersView, CustomerListView,
    AdminShippingRateListCreateView, AdminShippingRateDetailView,
)
from apps.content.views import (
    AdminPaymentAccountListCreateView, AdminPaymentAccountDetailView,
)
from apps.products.dashboard_views import (
    AdminProductListCreateView, AdminProductDetailView,
    AdminProductImageUploadView, AdminProductImageDetailView,
    AdminProductOptionsView, AdminBrandListCreateView,
)

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('orders/', AdminOrderListView.as_view(), name='admin_orders'),
    path('orders/export/', ExportOrdersView.as_view(), name='export_orders'),
    path('orders/<int:pk>/', AdminOrderDetailView.as_view(), name='admin_order_detail'),
    path('customers/', CustomerListView.as_view(), name='admin_customers'),
    path('shipping/', AdminShippingRateListCreateView.as_view(), name='admin_shipping_rates'),
    path('shipping/<int:pk>/', AdminShippingRateDetailView.as_view(), name='admin_shipping_rate_detail'),
    path('payment-accounts/', AdminPaymentAccountListCreateView.as_view(), name='admin_payment_accounts'),
    path(
        'payment-accounts/<int:pk>/',
        AdminPaymentAccountDetailView.as_view(),
        name='admin_payment_account_detail',
    ),
    path('products/', AdminProductListCreateView.as_view(), name='admin_products'),
    path('products/options/', AdminProductOptionsView.as_view(), name='admin_product_options'),
    path('products/brands/', AdminBrandListCreateView.as_view(), name='admin_brands'),
    path('products/<int:pk>/', AdminProductDetailView.as_view(), name='admin_product_detail'),
    path('products/<int:pk>/images/', AdminProductImageUploadView.as_view(), name='admin_product_images'),
    path('products/images/<int:pk>/', AdminProductImageDetailView.as_view(), name='admin_product_image_detail'),
]

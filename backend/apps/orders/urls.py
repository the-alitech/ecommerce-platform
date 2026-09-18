from django.urls import path
from .views import CheckoutView, OrderListView, OrderDetailView, OrderTrackView, ShippingRatesView

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('shipping/', ShippingRatesView.as_view(), name='shipping_rates'),
    path('', OrderListView.as_view(), name='order_list'),
    path('track/', OrderTrackView.as_view(), name='order_track'),
    path('<str:order_number>/', OrderDetailView.as_view(), name='order_detail'),
]

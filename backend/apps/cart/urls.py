from django.urls import path
from .views import CartView, CartAddView, CartItemUpdateView, CartMoveToSavedView

urlpatterns = [
    path('', CartView.as_view(), name='cart'),
    path('add/', CartAddView.as_view(), name='cart_add'),
    path('items/<int:item_id>/', CartItemUpdateView.as_view(), name='cart_item_update'),
    path('items/<int:item_id>/save/', CartMoveToSavedView.as_view(), name='cart_save_later'),
]

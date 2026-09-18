from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from apps.products.models import ProductVariant
from apps.products.querysets import storefront_products
from .models import CartItem
from .serializers import CartSerializer
from .services import get_or_create_cart


def _parse_quantity(value):
    if value is None or value == '':
        return None
    try:
        quantity = int(value)
    except (TypeError, ValueError):
        raise ValueError('Quantity must be a valid whole number.')
    if quantity < 0:
        raise ValueError('Quantity cannot be negative.')
    return quantity


class CartView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cart = get_or_create_cart(request)
        return Response(CartSerializer(cart, context={'request': request}).data)

    def delete(self, request):
        cart = get_or_create_cart(request)
        cart.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartAddView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        variant_id = request.data.get('variant_id')
        try:
            quantity = _parse_quantity(request.data.get('quantity', 1)) or 1
        except ValueError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        if not variant_id:
            return Response({'error': 'variant_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        variant = get_object_or_404(ProductVariant, id=variant_id, is_active=True)
        if not storefront_products().filter(pk=variant.product_id).exists():
            return Response({'error': 'This product is no longer available.'}, status=status.HTTP_404_NOT_FOUND)
        if variant.stock_quantity < quantity:
            return Response(
                {
                    'error': f'Only {variant.stock_quantity} item(s) available in stock.',
                    'available_stock': variant.stock_quantity,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        cart = get_or_create_cart(request)
        item, created = CartItem.objects.get_or_create(
            cart=cart, variant=variant, saved_for_later=False,
            defaults={'quantity': quantity}
        )
        if not created:
            item.quantity += quantity
            if item.quantity > variant.stock_quantity:
                return Response(
                    {
                        'error': f'Only {variant.stock_quantity} item(s) available in stock.',
                        'available_stock': variant.stock_quantity,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.save()
        return Response(
            CartSerializer(cart, context={'request': request}).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class CartItemUpdateView(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, item_id):
        cart = get_or_create_cart(request)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        try:
            quantity = _parse_quantity(request.data.get('quantity'))
        except ValueError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        saved_for_later = request.data.get('saved_for_later')

        if quantity is not None:
            if quantity <= 0:
                item.delete()
                return Response(CartSerializer(cart, context={'request': request}).data)
            variant = item.variant
            available = variant.stock_quantity
            if quantity > available and quantity > item.quantity:
                return Response(
                    {
                        'error': f'Only {available} item(s) available in stock.',
                        'available_stock': available,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            item.quantity = quantity

        if saved_for_later is not None:
            item.saved_for_later = bool(saved_for_later)
            if item.saved_for_later:
                existing = cart.items.filter(
                    variant=item.variant, saved_for_later=True
                ).exclude(pk=item.pk).first()
                if existing:
                    existing.quantity += item.quantity
                    existing.save()
                    item.delete()
                    return Response(CartSerializer(cart, context={'request': request}).data)

        try:
            item.save()
        except IntegrityError:
            return Response(
                {'error': 'This item is already in your saved list.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(CartSerializer(cart, context={'request': request}).data)

    def delete(self, request, item_id):
        cart = get_or_create_cart(request)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        item.delete()
        return Response(CartSerializer(cart, context={'request': request}).data)


class CartMoveToSavedView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, item_id):
        cart = get_or_create_cart(request)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        item.saved_for_later = True
        existing = cart.items.filter(variant=item.variant, saved_for_later=True).exclude(pk=item.pk).first()
        if existing:
            existing.quantity += item.quantity
            existing.save()
            item.delete()
        else:
            try:
                item.save()
            except IntegrityError:
                return Response(
                    {'error': 'This item is already in your saved list.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return Response(CartSerializer(cart, context={'request': request}).data)

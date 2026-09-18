from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.shortcuts import get_object_or_404
from apps.cart.services import get_or_create_cart
from apps.coupons.models import Coupon
from .models import Order, OrderItem, OrderStatusHistory
from .serializers import OrderSerializer, CheckoutSerializer, OrderTrackSerializer
from .shipping import calculate_shipping_cost, get_shipping_rates
from .notifications import (
    send_order_confirmation, send_admin_new_order_notification, send_order_status_update,
)


class ShippingRatesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        city = request.query_params.get('city', '')
        subtotal = request.query_params.get('subtotal')
        rates = get_shipping_rates()
        payload = {'rates': rates}
        if city:
            shipping_cost = calculate_shipping_cost(city)
            payload['city'] = city
            payload['shipping_cost'] = float(shipping_cost)
            if subtotal is not None:
                try:
                    subtotal_value = float(subtotal)
                    payload['subtotal'] = subtotal_value
                    payload['total'] = subtotal_value + float(shipping_cost)
                except (TypeError, ValueError):
                    pass
        return Response(payload)


class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        cart = get_or_create_cart(request)
        cart_items = cart.items.filter(saved_for_later=False)
        if not cart_items.exists():
            return Response({'error': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = cart.subtotal
        discount = 0
        coupon_code = data.get('coupon_code', '')
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code, is_active=True)
                if coupon.is_valid():
                    discount = coupon.calculate_discount(subtotal)
            except Coupon.DoesNotExist:
                pass

        shipping_cost = data.get('shipping_cost') or calculate_shipping_cost(data['shipping_address'].get('city', ''))
        total = subtotal - discount + shipping_cost

        order = Order.objects.create(
            user=request.user,
            payment_method=data['payment_method'],
            subtotal=subtotal,
            discount=discount,
            shipping_cost=shipping_cost,
            total=total,
            coupon_code=coupon_code,
            shipping_address=data['shipping_address'],
            billing_address=data['billing_address'],
            guest_email='',
            guest_phone='',
            notes=data.get('notes', ''),
        )

        for item in cart_items:
            variant = item.variant
            OrderItem.objects.create(
                order=order,
                variant=variant,
                product_name=variant.product.name,
                variant_info={
                    'color': variant.color, 'size': variant.size,
                    'waist_size': variant.waist_size, 'length': variant.length,
                    'sku': variant.sku,
                },
                quantity=item.quantity,
                unit_price=variant.effective_price,
                total_price=item.line_total,
            )
            variant.stock_quantity = max(0, variant.stock_quantity - item.quantity)
            variant.save()
            variant.product.sales_count += item.quantity
            variant.product.save(update_fields=['sales_count'])

        OrderStatusHistory.objects.create(order=order, status='pending')
        cart_items.delete()

        if coupon_code and discount > 0:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code)
                coupon.used_count += 1
                coupon.save(update_fields=['used_count'])
            except Coupon.DoesNotExist:
                pass

        send_order_confirmation(order)
        send_admin_new_order_notification(order)

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items', 'status_history')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'order_number'

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items', 'status_history')


class OrderTrackView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OrderTrackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order_number = serializer.validated_data['order_number']
        phone = serializer.validated_data['phone']
        try:
            order = Order.objects.prefetch_related('status_history').get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        order_phone = order.customer_phone.replace(' ', '').replace('-', '')
        input_phone = phone.replace(' ', '').replace('-', '')
        if order_phone[-10:] != input_phone[-10:]:
            return Response({'error': 'Phone number does not match.'}, status=status.HTTP_403_FORBIDDEN)
        return Response(OrderSerializer(order).data)

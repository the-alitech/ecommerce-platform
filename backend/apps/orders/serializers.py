from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory, ShippingRate
from .shipping import calculate_shipping_cost, get_shipping_rates, normalize_city_key


class ShippingRateSerializer(serializers.ModelSerializer):
    city_key = serializers.CharField(source='slug', read_only=True)
    rate = serializers.DecimalField(source='charge', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = ShippingRate
        fields = [
            'id', 'city', 'slug', 'city_key', 'charge', 'rate',
            'is_default', 'is_active', 'display_order', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {'slug': {'required': False, 'allow_blank': True}}

    def validate(self, data):
        is_default = data.get('is_default', getattr(self.instance, 'is_default', False))
        city = data.get('city', getattr(self.instance, 'city', ''))
        if is_default and not city.strip():
            raise serializers.ValidationError({'city': 'Default shipping rate needs a label.'})
        return data


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'variant_info', 'quantity', 'unit_price', 'total_price']


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = ['status', 'note', 'created_at']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'status', 'status_display', 'payment_method',
                  'payment_method_display', 'payment_status', 'subtotal', 'discount',
                  'shipping_cost', 'total', 'coupon_code', 'shipping_address',
                  'billing_address', 'tracking_number', 'notes', 'items',
                  'status_history', 'created_at', 'updated_at']
        read_only_fields = ['order_number', 'status', 'payment_status']


class CheckoutSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_METHODS)
    shipping_address = serializers.JSONField()
    billing_address = serializers.JSONField(required=False)
    coupon_code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        request = self.context['request']
        if not request.user.is_authenticated:
            raise serializers.ValidationError('Please sign in to place an order.')
        shipping_address = data.get('shipping_address') or {}
        city = (shipping_address.get('city') or '').strip()
        if not city:
            raise serializers.ValidationError({'shipping_address': 'City is required for shipping calculation.'})
        data['shipping_cost'] = calculate_shipping_cost(city)
        if not data.get('billing_address'):
            data['billing_address'] = data['shipping_address']
        return data


class ShippingQuoteSerializer(serializers.Serializer):
    city = serializers.CharField()
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    def validate_city(self, value):
        if not value.strip():
            raise serializers.ValidationError('City is required.')
        return value.strip()

    def to_representation(self, instance):
        city = instance['city']
        subtotal = instance.get('subtotal')
        shipping_cost = calculate_shipping_cost(city)
        data = {
            'city': city,
            'city_key': normalize_city_key(city),
            'shipping_cost': shipping_cost,
            'rates': get_shipping_rates(),
        }
        if subtotal is not None:
            data['subtotal'] = subtotal
            data['total'] = subtotal + shipping_cost
        return data


class OrderTrackSerializer(serializers.Serializer):
    order_number = serializers.CharField()
    phone = serializers.CharField()


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    tracking_number = serializers.CharField(required=False, allow_blank=True)
    note = serializers.CharField(required=False, allow_blank=True)

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Coupon
from .serializers import CouponValidateSerializer, CouponSerializer


class CouponValidateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CouponValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['code']
        subtotal = serializer.validated_data['subtotal']
        try:
            coupon = Coupon.objects.get(code__iexact=code)
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'error': 'Invalid coupon code.'})
        if not coupon.is_valid():
            return Response({'valid': False, 'error': 'Coupon has expired or is no longer valid.'})
        discount = coupon.calculate_discount(subtotal)
        if discount <= 0:
            return Response({'valid': False, 'error': f'Minimum order amount is PKR {coupon.min_order_amount}.'})
        return Response({
            'valid': True,
            'code': coupon.code,
            'discount': float(discount),
            'discount_type': coupon.discount_type,
            'value': float(coupon.value),
        })


class CouponListCreateView(generics.ListCreateAPIView):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.IsAdminUser()]


class CouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAdminUser]

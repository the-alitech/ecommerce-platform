import csv
from datetime import timedelta
from django.http import HttpResponse
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.users.models import User
from .models import Order, OrderStatusHistory, ShippingRate
from .serializers import OrderSerializer, OrderStatusUpdateSerializer, ShippingRateSerializer
from .notifications import send_order_status_update


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff


def _month_start(dt, months_back=0):
    """Return first day of the month, optionally months_back earlier."""
    year, month = dt.year, dt.month - months_back
    while month <= 0:
        month += 12
        year -= 1
    return dt.replace(year=year, month=month, day=1, hour=0, minute=0, second=0, microsecond=0)


def _sales_summary(qs):
    agg = qs.aggregate(total=Sum('total'), count=Count('id'))
    return {
        'sales': float(agg['total'] or 0),
        'orders': agg['count'] or 0,
    }


class DashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from apps.products.models import Product, ProductVariant

        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday_start = today_start - timedelta(days=1)
        week_start = today_start - timedelta(days=today_start.weekday())
        month_start = _month_start(today_start, 0)
        last_month_start = _month_start(today_start, 1)
        three_months_start = _month_start(today_start, 3)
        six_months_start = _month_start(today_start, 6)
        one_year_start = _month_start(today_start, 12)
        thirty_days_ago = now - timedelta(days=30)

        orders = Order.objects.exclude(status='cancelled')

        today = _sales_summary(orders.filter(created_at__gte=today_start))
        yesterday = _sales_summary(orders.filter(
            created_at__gte=yesterday_start, created_at__lt=today_start
        ))
        this_week = _sales_summary(orders.filter(created_at__gte=week_start))
        this_month = _sales_summary(orders.filter(created_at__gte=month_start))
        last_month = _sales_summary(orders.filter(
            created_at__gte=last_month_start, created_at__lt=month_start
        ))
        last_3_months = _sales_summary(orders.filter(created_at__gte=three_months_start))
        last_6_months = _sales_summary(orders.filter(created_at__gte=six_months_start))
        last_1_year = _sales_summary(orders.filter(created_at__gte=one_year_start))
        previous = _sales_summary(orders.filter(created_at__lt=today_start))
        all_time = _sales_summary(orders)

        total_customers = User.objects.filter(is_staff=False).count()
        total_products = Product.objects.count()
        active_products = Product.objects.filter(is_active=True).count()
        low_stock = ProductVariant.objects.filter(is_active=True, stock_quantity__lte=5).count()

        # Daily revenue chart (last 30 days)
        recent_orders = orders.filter(created_at__gte=thirty_days_ago)
        revenue_chart = list(
            recent_orders.annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(revenue=Sum('total'), orders=Count('id'))
            .order_by('date')
        )
        for item in revenue_chart:
            item['date'] = item['date'].isoformat()
            item['revenue'] = float(item['revenue'])

        # Monthly revenue chart (last 12 months)
        monthly_chart = list(
            orders.filter(created_at__gte=one_year_start)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(revenue=Sum('total'), orders=Count('id'))
            .order_by('month')
        )
        for item in monthly_chart:
            item['month'] = item['month'].strftime('%Y-%m')
            item['label'] = item['month']
            item['revenue'] = float(item['revenue'])

        recent = Order.objects.order_by('-created_at')[:10]
        status_counts = dict(
            Order.objects.values('status').annotate(count=Count('id')).values_list('status', 'count')
        )

        return Response({
            # Flat fields kept for compatibility
            'total_sales': all_time['sales'],
            'today_sales': today['sales'],
            'yesterday_sales': yesterday['sales'],
            'previous_sales': previous['sales'],
            'this_week_sales': this_week['sales'],
            'this_month_sales': this_month['sales'],
            'last_month_sales': last_month['sales'],
            'last_3_months_sales': last_3_months['sales'],
            'last_6_months_sales': last_6_months['sales'],
            'last_1_year_sales': last_1_year['sales'],
            'total_orders': all_time['orders'],
            'today_orders': today['orders'],
            'this_week_orders': this_week['orders'],
            'this_month_orders': this_month['orders'],
            'last_month_orders': last_month['orders'],
            'last_3_months_orders': last_3_months['orders'],
            'last_6_months_orders': last_6_months['orders'],
            'last_1_year_orders': last_1_year['orders'],
            'previous_orders': previous['orders'],
            # Grouped periods for cleaner UI
            'sales_periods': [
                {'key': 'today', 'label': "Today's Sales", 'sales': today['sales'], 'orders': today['orders']},
                {'key': 'yesterday', 'label': 'Yesterday', 'sales': yesterday['sales'], 'orders': yesterday['orders']},
                {'key': 'previous', 'label': 'Previous (Before Today)', 'sales': previous['sales'], 'orders': previous['orders']},
                {'key': 'this_week', 'label': 'This Week', 'sales': this_week['sales'], 'orders': this_week['orders']},
                {'key': 'this_month', 'label': 'This Month', 'sales': this_month['sales'], 'orders': this_month['orders']},
                {'key': 'last_month', 'label': 'Last Month', 'sales': last_month['sales'], 'orders': last_month['orders']},
                {'key': 'last_3_months', 'label': 'Last 3 Months', 'sales': last_3_months['sales'], 'orders': last_3_months['orders']},
                {'key': 'last_6_months', 'label': 'Last 6 Months', 'sales': last_6_months['sales'], 'orders': last_6_months['orders']},
                {'key': 'last_1_year', 'label': 'Last 1 Year', 'sales': last_1_year['sales'], 'orders': last_1_year['orders']},
                {'key': 'all_time', 'label': 'All Time', 'sales': all_time['sales'], 'orders': all_time['orders']},
            ],
            'total_customers': total_customers,
            'total_products': total_products,
            'active_products': active_products,
            'low_stock_variants': low_stock,
            'revenue_chart': revenue_chart,
            'monthly_chart': monthly_chart,
            'status_counts': status_counts,
            'recent_orders': OrderSerializer(recent, many=True).data,
        })



class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['status', 'payment_method']
    search_fields = ['order_number', 'guest_email', 'guest_phone']

    def get_queryset(self):
        return Order.objects.all().prefetch_related('items', 'status_history')


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]
    queryset = Order.objects.all().prefetch_related('items', 'status_history')

    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        old_status = order.status
        order.status = data['status']
        if data.get('tracking_number'):
            order.tracking_number = data['tracking_number']
        order.save()
        OrderStatusHistory.objects.create(
            order=order, status=data['status'],
            note=data.get('note', ''), created_by=request.user
        )
        if old_status != data['status']:
            send_order_status_update(order, data.get('note', ''))
        return Response(OrderSerializer(order).data)


class ExportOrdersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="orders.csv"'
        writer = csv.writer(response)
        writer.writerow(['Order Number', 'Status', 'Customer', 'Phone', 'Total', 'Payment', 'Date'])
        for order in Order.objects.all().order_by('-created_at'):
            writer.writerow([
                order.order_number, order.status, order.customer_email,
                order.customer_phone, order.total, order.payment_method,
                order.created_at.strftime('%Y-%m-%d %H:%M'),
            ])
        return response


class CustomerListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from apps.users.serializers import UserSerializer
        customers = User.objects.filter(is_staff=False).annotate(
            order_count=Count('orders'),
            total_spent=Sum('orders__total')
        ).order_by('-date_joined')[:100]
        data = []
        for c in customers:
            data.append({
                **UserSerializer(c).data,
                'order_count': c.order_count or 0,
                'total_spent': float(c.total_spent or 0),
            })
        return Response(data)


class AdminShippingRateListCreateView(generics.ListCreateAPIView):
    serializer_class = ShippingRateSerializer
    permission_classes = [IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        return ShippingRate.objects.all().order_by('display_order', 'city')


class AdminShippingRateDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ShippingRateSerializer
    permission_classes = [IsAdminUser]
    queryset = ShippingRate.objects.all()

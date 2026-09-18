'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ordersApi, formatPrice, type Order } from '@/lib/api';

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<Order | null>(null);
  const success = searchParams.get('success');

  useEffect(() => {
    if (!orderNumber) return;
    const cached = sessionStorage.getItem(`order_${orderNumber}`);
    if (cached) {
      try {
        setOrder(JSON.parse(cached));
        return;
      } catch {
        sessionStorage.removeItem(`order_${orderNumber}`);
      }
    }
    ordersApi.detail(orderNumber).then(setOrder).catch(() => setOrder(null));
  }, [orderNumber]);

  if (!order) {
    return <div className="py-20 text-center">Loading order...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      {success && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
          Order placed successfully! Confirmation email sent.
        </div>
      )}
      <h1 className="section-title">Order {order.order_number}</h1>
      <p className="mt-2 text-brand-600">Status: <strong>{order.status_display}</strong></p>

      <div className="mt-8 card p-6 space-y-4">
        <h2 className="font-semibold">Items</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm border-b border-brand-100 pb-2">
            <div>
              <p className="font-medium">{item.product_name}</p>
              <p className="text-brand-500">
                {[item.variant_info?.color, item.variant_info?.size].filter(Boolean).join(' / ')}
              </p>
            </div>
            <p>x{item.quantity} — {formatPrice(item.total_price)}</p>
          </div>
        ))}
        <div className="mt-4 space-y-2 border-t border-brand-100 pt-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.shipping_cost && parseFloat(order.shipping_cost) > 0 && (
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatPrice(order.shipping_cost)}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between font-semibold pt-4 border-t">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
        <p className="text-sm text-brand-500">Payment: {order.payment_method_display}</p>
      </div>

      <div className="mt-6 flex gap-4">
        <Link href="/track-order" className="btn-secondary">Track Order</Link>
        <Link href="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
}

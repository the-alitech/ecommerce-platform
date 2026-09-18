'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ordersApi, type Order } from '@/lib/api';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await ordersApi.track(orderNumber, phone);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order not found');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="section-title text-center">Track Your Order</h1>
      <p className="mt-2 text-center text-brand-600">Enter your order number and phone to check status</p>

      <form onSubmit={handleTrack} className="mt-8 card p-8 space-y-4">
        <input className="input-field" placeholder="Order Number (e.g. EE1A2B3C4D)" required
          value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
        <input className="input-field" placeholder="Phone Number" required
          value={phone} onChange={(e) => setPhone(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Tracking...' : 'Track Order'}
        </button>
      </form>

      {order && (
        <div className="mt-8 card p-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-brand-500">Order Number</p>
              <p className="font-semibold text-lg">{order.order_number}</p>
            </div>
            <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-800">
              {order.status_display}
            </span>
          </div>

          {order.tracking_number && (
            <p className="mt-4 text-sm">Tracking: <strong>{order.tracking_number}</strong></p>
          )}

          <div className="mt-8">
            <div className="flex justify-between">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i <= currentStep ? 'bg-brand-900 text-white' : 'bg-brand-100 text-brand-400'
                  }`}>
                    {i + 1}
                  </div>
                  <p className="mt-2 text-xs capitalize text-center">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-brand-100 pt-4">
            <h3 className="font-semibold">Items</h3>
            {order.items.map((item, i) => (
              <div key={i} className="mt-2 flex justify-between text-sm">
                <span>{item.product_name} x{item.quantity}</span>
                <span>PKR {item.total_price}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

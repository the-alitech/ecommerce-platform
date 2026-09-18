'use client';

import { useEffect, useState } from 'react';
import { adminApi, BACKEND_URL, type Order } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    adminApi<{ results: Order[] }>('/dashboard/orders/')
      .then((d) => setOrders(d.results || (d as unknown as Order[])))
      .catch(console.error);
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await adminApi(`/dashboard/orders/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status, status_display: status } : o));
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
        <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2000/api'}/dashboard/orders/export/`}
          className="text-sm bg-indigo-900 text-white px-4 py-2 rounded-lg hover:bg-indigo-800"
          target="_blank" rel="noopener">
          Export CSV
        </a>
      </div>
      <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Order #</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Payment</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{order.order_number}</td>
                <td className="px-4 py-3">
                  <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="border rounded px-2 py-1 text-xs">
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">{order.payment_method_display}</td>
                <td className="px-4 py-3">PKR {order.total}</td>
                <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <a href={`${BACKEND_URL}/admin/orders/order/${order.id}/change/`} target="_blank" rel="noopener"
                    className="text-indigo-600 hover:underline text-xs">View in Django</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length && <p className="p-8 text-center text-gray-500">No orders found</p>}
      </div>
    </div>
  );
}

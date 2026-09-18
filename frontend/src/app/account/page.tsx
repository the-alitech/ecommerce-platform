'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ordersApi, normalizeList, type Order } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function AccountPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    ordersApi.list().then((d) => setOrders(normalizeList(d))).catch(() => {});
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="section-title">My Account</h1>
          <p className="mt-2 text-brand-600">{user.first_name} {user.last_name} · {user.email}</p>
        </div>
        <button onClick={() => { logout(); router.push('/'); }} className="text-sm text-red-600 hover:underline">
          Sign Out
        </button>
      </div>

      <section className="mt-12">
        <h2 className="font-semibold text-lg">Order History</h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-brand-500">No orders yet. <Link href="/shop" className="underline">Start shopping</Link></p>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.order_number}`} className="card block p-4 hover:shadow-md transition">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-brand-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">PKR {order.total}</p>
                    <p className="text-sm text-brand-500">{order.status_display}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

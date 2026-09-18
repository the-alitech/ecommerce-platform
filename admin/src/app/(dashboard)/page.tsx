'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  DollarSign, ShoppingCart, Users, Package, AlertTriangle,
} from 'lucide-react';
import { adminApi, type DashboardStats } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const [chartMode, setChartMode] = useState<'daily' | 'monthly'>('daily');

  useEffect(() => {
    adminApi<DashboardStats>('/dashboard/stats/')
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'));
  }, []);

  const money = (value?: number) => `PKR ${(value || 0).toLocaleString('en-PK')}`;

  const periodColors = [
    'bg-emerald-500',
    'bg-teal-500',
    'bg-green-600',
    'bg-cyan-600',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-600',
    'bg-rose-500',
  ];

  const overviewCards = [
    {
      label: 'Customers',
      value: String(stats?.total_customers || 0),
      sub: 'Registered users',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      label: 'Active Products',
      value: String(stats?.active_products || 0),
      sub: `${stats?.total_products || 0} total in catalog`,
      icon: Package,
      color: 'bg-indigo-500',
    },
    {
      label: 'Total Orders',
      value: String(stats?.total_orders || 0),
      sub: 'Excluding cancelled',
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      label: 'All-Time Sales',
      value: money(stats?.total_sales),
      sub: 'Lifetime revenue',
      icon: DollarSign,
      color: 'bg-green-600',
    },
  ];

  const chartData =
    chartMode === 'daily'
      ? (stats?.revenue_chart || []).map((row) => ({
          label: row.date,
          revenue: row.revenue,
          orders: row.orders,
        }))
      : (stats?.monthly_chart || []).map((row) => ({
          label: row.label || row.month,
          revenue: row.revenue,
          orders: row.orders,
        }));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Sales by period, orders, and catalog overview</p>
        </div>
        <div className="flex gap-2">
          <Link href="/orders" className="rounded-lg bg-indigo-900 px-4 py-2 text-sm text-white hover:bg-indigo-800">
            View Orders
          </Link>
          <Link href="/products" className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
            Manage Products
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <h2 className="mt-8 text-lg font-semibold text-gray-900">Sales by Period</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {(stats?.sales_periods || []).map((period, index) => (
          <div key={period.key} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${periodColors[index % periodColors.length]}`} />
              <p className="text-sm text-gray-500">{period.label}</p>
            </div>
            <p className="mt-2 text-xl font-bold text-gray-900">{money(period.sales)}</p>
            <p className="mt-1 text-xs text-gray-400">
              {period.orders} {period.orders === 1 ? 'order' : 'orders'}
            </p>
          </div>
        ))}
        {!stats?.sales_periods?.length && !error && (
          <p className="text-sm text-gray-500 col-span-full">Loading sales periods...</p>
        )}
      </div>

      <h2 className="mt-8 text-lg font-semibold text-gray-900">Store Overview</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-4">
            <div className={`${card.color} p-3 rounded-lg text-white shrink-0`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
              <p className="mt-1 text-xs text-gray-400">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {(stats?.low_stock_variants || 0) > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          {stats?.low_stock_variants} variant(s) have low stock (5 or fewer). Check products in Django Admin.
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-lg">Revenue Chart</h2>
            <div className="flex rounded-lg border overflow-hidden text-sm">
              <button
                type="button"
                onClick={() => setChartMode('daily')}
                className={`px-3 py-1.5 ${chartMode === 'daily' ? 'bg-indigo-900 text-white' : 'bg-white text-gray-600'}`}
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => setChartMode('monthly')}
                className={`px-3 py-1.5 ${chartMode === 'monthly' ? 'bg-indigo-900 text-white' : 'bg-white text-gray-600'}`}
              >
                Last 12 Months
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`PKR ${Number(value).toLocaleString('en-PK')}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#312e81" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-lg">Recent Orders</h2>
            <Link href="/orders" className="text-sm text-indigo-600 hover:underline">See all</Link>
          </div>
          <div className="space-y-3">
            {(stats?.recent_orders || []).map((order) => (
              <div key={order.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-sm">{order.order_number}</p>
                  <p className="text-xs text-gray-500">{order.status_display} · {order.payment_method_display}</p>
                </div>
                <p className="font-semibold text-sm">PKR {Number(order.total).toLocaleString('en-PK')}</p>
              </div>
            ))}
            {!stats?.recent_orders?.length && <p className="text-gray-500 text-sm">No orders yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

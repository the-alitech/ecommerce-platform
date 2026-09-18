'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin-api';

interface Customer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  order_count: number;
  total_spent: number;
  date_joined: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    adminApi<Customer[]>('/dashboard/customers/').then(setCustomers).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Customers</h1>
      <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Orders</th>
              <th className="px-4 py-3 text-left">Total Spent</th>
              <th className="px-4 py-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{c.first_name} {c.last_name}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">{c.phone || '-'}</td>
                <td className="px-4 py-3">{c.order_count}</td>
                <td className="px-4 py-3">PKR {c.total_spent.toLocaleString()}</td>
                <td className="px-4 py-3">{new Date(c.date_joined).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

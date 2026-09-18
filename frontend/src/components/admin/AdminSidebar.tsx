'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Image, FileText, LogOut, Truck, CreditCard,
} from 'lucide-react';
import clsx from 'clsx';
import { BACKEND_URL } from '@/lib/admin-api';

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/shipping', label: 'Shipping', icon: Truck },
  { href: '/admin/payment-accounts', label: 'Payments', icon: CreditCard },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/banners', label: 'Banners', icon: Image },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const logout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-6 border-b border-indigo-800">
        <h1 className="text-xl font-bold">H.B Shoes Admin</h1>
        <p className="mt-1 text-xs text-indigo-300">Store management</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                active ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-indigo-800 space-y-2">
        <a
          href={`${BACKEND_URL}/admin/`}
          target="_blank"
          rel="noopener"
          className="block text-xs text-indigo-300 hover:underline"
        >
          Advanced Django Admin →
        </a>
        <Link href="/" className="block text-xs text-indigo-300 hover:underline">
          ← Back to store
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-indigo-200 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );
}

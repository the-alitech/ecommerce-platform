'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Image, FileText, LogOut, Truck, CreditCard,
} from 'lucide-react';
import clsx from 'clsx';

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/coupons', label: 'Coupons', icon: Tag },
  { href: '/shipping', label: 'Shipping', icon: Truck },
  { href: '/payment-accounts', label: 'Payments', icon: CreditCard },
  { href: '/content', label: 'Content', icon: FileText },
  { href: '/banners', label: 'Banners', icon: Image },
];

export function Sidebar() {
  const pathname = usePathname();

  const logout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-6 border-b border-indigo-800">
        <h1 className="text-xl font-bold">EcomEarn Admin</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
              pathname === href ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-indigo-800">
        <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:2000'}/admin/`} target="_blank" rel="noopener" className="block text-xs text-indigo-300 mb-2 hover:underline">
          Django Admin →
        </a>
        <button onClick={logout} className="flex items-center gap-2 text-sm text-indigo-200 hover:text-white">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );
}

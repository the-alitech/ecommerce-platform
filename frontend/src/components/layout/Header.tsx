'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingBag, Heart, User, Menu, X, Search } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/lib/store';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/categories', label: 'Categories' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/track-order', label: 'Track Order' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuthStore();
  const { itemCount } = useCartStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-500 ${
        scrolled
          ? 'glass border-brand-100/80 shadow-card backdrop-blur-xl'
          : 'border-transparent bg-white/60 shadow-soft backdrop-blur-md'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-16' : 'h-[4.25rem]'}`}>
          <Link href="/" className="group flex items-center gap-1">
            <span className="font-display text-[1.65rem] font-bold tracking-tight text-brand-950 transition-transform duration-300 group-hover:scale-105">
              H.B
            </span>
            <span className="font-display text-[1.65rem] font-bold tracking-tight text-gradient transition-transform duration-300 group-hover:scale-105">
              Shoes
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/shop"
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-brand-600 transition-all duration-300 hover:scale-110 hover:bg-brand-100 hover:text-accent-600"
            >
              <Search className="h-[1.15rem] w-[1.15rem]" />
            </Link>
            <Link
              href="/wishlist"
              className="flex h-10 w-10 items-center justify-center rounded-full text-brand-600 transition-all duration-300 hover:scale-110 hover:bg-rose-50 hover:text-rose-500"
            >
              <Heart className="h-[1.15rem] w-[1.15rem]" />
            </Link>
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-brand-600 transition-all duration-300 hover:scale-110 hover:bg-accent-50 hover:text-accent-600"
            >
              <ShoppingBag className="h-[1.15rem] w-[1.15rem]" />
              {itemCount > 0 && (
                <span
                  key={itemCount}
                  className="absolute -right-0.5 -top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-accent-gradient px-1 text-[10px] font-bold text-white shadow-glow-sm motion-safe:animate-bounce-in"
                >
                  {itemCount}
                </span>
              )}
            </Link>
            <Link
              href={user ? '/account' : '/login'}
              className="flex h-10 w-10 items-center justify-center rounded-full text-brand-600 transition-all duration-300 hover:scale-110 hover:bg-brand-100 hover:text-accent-600"
            >
              <User className="h-[1.15rem] w-[1.15rem]" />
            </Link>
            <button
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full text-brand-600 transition-all duration-300 hover:scale-110 hover:bg-brand-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden border-t border-brand-100 bg-white/95 backdrop-blur-xl transition-all duration-400 ease-out ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 border-transparent'
        }`}
      >
        <nav className="px-4 py-3">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-brand-700 transition-all duration-300 hover:translate-x-1 hover:bg-accent-50 hover:text-accent-700 motion-safe:animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

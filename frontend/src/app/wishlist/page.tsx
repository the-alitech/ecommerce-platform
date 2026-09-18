'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { wishlistApi, type WishlistItem } from '@/lib/api';
import { ProductCard } from '@/components/products/ProductCard';
import { useAuthStore } from '@/lib/store';

export default function WishlistPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      wishlistApi.list()
        .then(setItems)
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p>Please <Link href="/login" className="underline">sign in</Link> to view your wishlist.</p>
      </div>
    );
  }

  const products = items.filter((item) => item.product);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="section-title">My Wishlist</h1>
      {loading ? (
        <p className="mt-8 text-brand-500">Loading wishlist...</p>
      ) : products.length === 0 ? (
        <p className="mt-8 text-brand-500">Your wishlist is empty.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}

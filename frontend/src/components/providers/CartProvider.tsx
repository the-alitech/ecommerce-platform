'use client';

import { useEffect } from 'react';
import { cartApi } from '@/lib/api';
import { useCartStore } from '@/lib/store';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const setItemCount = useCartStore((s) => s.setItemCount);

  useEffect(() => {
    cartApi
      .get()
      .then((cart) => setItemCount(cart.total_items))
      .catch(() => setItemCount(0));
  }, [setItemCount]);

  return <>{children}</>;
}

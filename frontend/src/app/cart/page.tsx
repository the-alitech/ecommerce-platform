'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Bookmark } from 'lucide-react';
import { cartApi, formatPrice, type Cart } from '@/lib/api';
import { useAuthStore, useCartStore } from '@/lib/store';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { setItemCount } = useCartStore();
  const { user } = useAuthStore();
  const checkoutHref = user ? '/checkout' : '/login?next=/checkout';

  const loadCart = async () => {
    setError('');
    try {
      const data = await cartApi.get();
      setCart(data);
      setItemCount(data.total_items);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCart(); }, []);

  const updateQty = async (itemId: number, quantity: number) => {
    if (!cart) return;
    const previousCart = cart;
    setError('');
    setCart({
      ...cart,
      items: cart.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    });
    try {
      const data = await cartApi.update(itemId, { quantity });
      setCart(data);
      setItemCount(data.total_items);
    } catch (err) {
      setCart(previousCart);
      setError(err instanceof Error ? err.message : 'Failed to update quantity');
    }
  };

  const removeItem = async (itemId: number) => {
    setError('');
    try {
      const data = await cartApi.remove(itemId);
      setCart(data);
      setItemCount(data.total_items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    }
  };

  const saveForLater = async (itemId: number) => {
    setError('');
    try {
      const data = await cartApi.update(itemId, { saved_for_later: true });
      setCart(data);
      setItemCount(data.total_items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
    }
  };

  if (loading) return <div className="py-20 text-center">Loading cart...</div>;

  const items = cart?.items || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="section-title">Shopping Cart</h1>
      {error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {items.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-brand-500">Your cart is empty.</p>
          <Link href="/shop" className="btn-primary mt-6 inline-block">Continue Shopping</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const maxQty = Math.max(item.quantity, item.stock_quantity ?? 10);
              return (
                <div key={item.id} className="card flex gap-4 p-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-brand-100">
                    {item.primary_image && (
                      <Image src={item.primary_image} alt={item.product_name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Link href={`/products/${item.product_slug}`} className="font-medium hover:underline">
                      {item.product_name}
                    </Link>
                    <p className="text-sm text-brand-500 mt-1">
                      {[item.variant_details.color, item.variant_details.size].filter(Boolean).join(' / ')}
                    </p>
                    <p className="mt-2 font-semibold">{formatPrice(item.line_total)}</p>
                    {item.stock_quantity != null && (
                      <p className="mt-1 text-xs text-brand-500">
                        {item.stock_quantity} available in stock
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-4">
                      <select
                        value={item.quantity}
                        onChange={(e) => updateQty(item.id, parseInt(e.target.value, 10))}
                        className="input-field w-20 py-1"
                      >
                        {Array.from({ length: maxQty }).map((_, i) => (
                          <option key={i} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                      <button onClick={() => saveForLater(item.id)} className="text-sm text-brand-500 hover:text-brand-700 flex items-center gap-1">
                        <Bookmark className="h-4 w-4" /> Save for later
                      </button>
                      <button onClick={() => removeItem(item.id)} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="card p-6 h-fit sticky top-24">
            <h2 className="font-semibold text-lg">Order Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(cart?.subtotal || '0')}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>Calculated at checkout</span></div>
            </div>
            <div className="mt-4 flex justify-between font-semibold text-lg border-t border-brand-100 pt-4">
              <span>Total</span><span>{formatPrice(cart?.subtotal || '0')}</span>
            </div>
            <Link href={checkoutHref} className="btn-primary w-full mt-6 text-center block">
              {user ? 'Proceed to Checkout' : 'Sign In to Checkout'}
            </Link>
            {!user && (
              <p className="mt-3 text-center text-xs text-brand-500">
                You need to sign in before placing an order.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

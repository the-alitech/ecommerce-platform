'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  cartApi,
  contentApi,
  ordersApi,
  formatPrice,
  normalizeList,
  type Cart,
  type ShippingRate,
  type SiteSettings,
  type PaymentAccount,
} from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
  { id: 'bank_transfer', label: 'Bank Transfer', desc: 'Transfer to our bank account' },
  { id: 'jazzcash', label: 'JazzCash', desc: 'Send payment via JazzCash' },
  { id: 'easypaisa', label: 'Easypaisa', desc: 'Send payment via Easypaisa' },
];

const LOGIN_HREF = '/login?next=/checkout';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [authReady, setAuthReady] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: 'Punjab',
    postal_code: '',
    country: 'Pakistan',
    notes: '',
  });

  const subtotal = parseFloat(cart?.subtotal || '0');

  useEffect(() => {
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace(LOGIN_HREF);
    }
  }, [authReady, user, router]);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      full_name: prev.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      phone: prev.phone || user.phone || '',
    }));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    cartApi.get().then(setCart).catch(() => setCart(null));
    contentApi.settings().then(setSiteSettings).catch(() => setSiteSettings(null));
    contentApi.paymentAccounts()
      .then((data) => setPaymentAccounts(normalizeList<PaymentAccount>(data)))
      .catch(() => setPaymentAccounts([]));
    ordersApi.shippingRates()
      .then((data) => {
        const rates = data.rates.filter((rate) => !rate.is_default);
        setShippingRates(rates.length ? rates : data.rates);
        if (rates[0]) {
          setForm((prev) => ({ ...prev, city: rates[0].city_key }));
        } else if (data.rates[0]) {
          setForm((prev) => ({ ...prev, city: data.rates[0].city_key }));
        }
      })
      .catch(() => setShippingRates([]))
      .finally(() => setShippingLoading(false));
  }, [user]);

  useEffect(() => {
    if (!form.city) {
      setShippingCost(0);
      return;
    }
    ordersApi.shippingRates(form.city, subtotal)
      .then((data) => setShippingCost(data.shipping_cost ?? 0))
      .catch(() => {
        const fallback = shippingRates.find((rate) => rate.city_key === form.city);
        setShippingCost(fallback?.rate ?? 0);
      });
  }, [form.city, subtotal, shippingRates]);

  const orderTotal = subtotal + shippingCost;
  const showPaymentDetails = paymentMethod !== 'cod';

  const selectedAccounts = useMemo(
    () => paymentAccounts.filter((account) => account.method === paymentMethod),
    [paymentAccounts, paymentMethod]
  );

  const selectedCity = useMemo(
    () => shippingRates.find((rate) => rate.city_key === form.city),
    [shippingRates, form.city]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(LOGIN_HREF);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const cityName = selectedCity?.city || form.city;
      const shipping_address = {
        full_name: form.full_name,
        phone: form.phone,
        address_line1: form.address_line1,
        address_line2: form.address_line2,
        city: cityName,
        state: form.state,
        postal_code: form.postal_code,
        country: form.country,
      };
      const order = await ordersApi.checkout({
        payment_method: paymentMethod,
        shipping_address,
        coupon_code: couponCode || undefined,
        notes: form.notes,
      });
      sessionStorage.setItem(`order_${order.order_number}`, JSON.stringify(order));
      router.push(`/orders/${order.order_number}?success=1`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed';
      if (/credentials|authenticated|sign in|unauthorized|401/i.test(message)) {
        router.push(LOGIN_HREF);
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!authReady || !user) {
    return (
      <div className="py-20 text-center">
        <p className="text-brand-600">Please sign in to place your order.</p>
        <Link href={LOGIN_HREF} className="btn-primary mt-4 inline-block">
          Sign In to Continue
        </Link>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="py-20 text-center">
        <p>Your cart is empty.</p>
        <Link href="/shop" className="btn-secondary mt-4 inline-block">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="section-title">Checkout</h1>
      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <section className="card p-6">
            <h2 className="font-semibold text-lg">Shipping Information</h2>
            <p className="mt-1 text-sm text-brand-500">Signed in as {user.email}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input className="input-field sm:col-span-2" placeholder="Full Name" required
                value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              <input className="input-field" placeholder="Phone" required
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <select
                className="input-field"
                required
                value={form.city}
                disabled={shippingLoading || shippingRates.length === 0}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              >
                {shippingLoading && <option value="">Loading cities...</option>}
                {!shippingLoading && shippingRates.length === 0 && (
                  <option value="">No shipping cities configured</option>
                )}
                {shippingRates.map((rate) => (
                  <option key={rate.city_key} value={rate.city_key}>
                    {rate.city} — {formatPrice(rate.rate)} shipping
                  </option>
                ))}
              </select>
              <input className="input-field sm:col-span-2" placeholder="Address Line 1" required
                value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} />
              <input className="input-field sm:col-span-2" placeholder="Address Line 2"
                value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} />
              <input className="input-field" placeholder="Postal Code" required
                value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
              <input className="input-field" placeholder="Country" required
                value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-semibold text-lg">Payment Method</h2>
            <div className="mt-4 space-y-3">
              {PAYMENT_METHODS.map((pm) => (
                <label key={pm.id} className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer ${paymentMethod === pm.id ? 'border-brand-900 bg-brand-50' : 'border-brand-200'}`}>
                  <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id}
                    onChange={() => setPaymentMethod(pm.id)} className="mt-1" />
                  <div>
                    <p className="font-medium">{pm.label}</p>
                    <p className="text-sm text-brand-500">{pm.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {showPaymentDetails && (
              <div className="mt-4 rounded-xl border border-accent-200 bg-accent-50/60 p-5">
                <h3 className="font-semibold text-brand-900">Payment Details</h3>
                <p className="mt-1 text-sm text-brand-600">
                  Send <span className="font-semibold">{formatPrice(orderTotal)}</span> to the account below, then place your order.
                </p>

                <div className="mt-4 space-y-3">
                  {selectedAccounts.length > 0 ? (
                    selectedAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="rounded-lg border border-brand-200 bg-white px-4 py-3"
                      >
                        <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
                          {account.title || account.method_display}
                        </p>
                        {account.account_title && (
                          <p className="mt-1 text-sm text-brand-600">
                            Account Title: <span className="font-medium text-brand-900">{account.account_title}</span>
                          </p>
                        )}
                        {account.bank_name && (
                          <p className="mt-1 text-sm text-brand-600">
                            Bank: <span className="font-medium text-brand-900">{account.bank_name}</span>
                          </p>
                        )}
                        <p className="mt-1 font-semibold text-brand-900">
                          {account.method === 'bank_transfer' ? 'Account No: ' : 'Number: '}
                          {account.account_number}
                        </p>
                        {account.iban && (
                          <p className="mt-1 text-sm text-brand-600">
                            IBAN: <span className="font-medium text-brand-900">{account.iban}</span>
                          </p>
                        )}
                        {account.instructions && (
                          <p className="mt-2 text-sm text-brand-500">{account.instructions}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-brand-500">
                      Payment account details are not configured yet. Please contact support.
                    </p>
                  )}
                </div>

                <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                  After payment, please share the payment screenshot with admin
                  {siteSettings?.whatsapp_number ? (
                    <>
                      {' '}on WhatsApp at{' '}
                      <span className="font-semibold">{siteSettings.whatsapp_number}</span>.
                    </>
                  ) : (
                    '.'
                  )}
                </p>
              </div>
            )}
          </section>
        </div>

        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-lg">Order Review</h2>
            <div className="mt-4 space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product_name} x{item.quantity}</span>
                  <span>{formatPrice(item.line_total)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input className="input-field flex-1" placeholder="Coupon code"
                value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
            </div>
            <div className="mt-4 space-y-2 border-t border-brand-100 pt-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping ({selectedCity?.city || 'City'})</span>
                <span>{shippingLoading ? '...' : formatPrice(shippingCost)}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between font-semibold text-lg border-t border-brand-100 pt-4">
              <span>Total</span>
              <span>{formatPrice(orderTotal)}</span>
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            <button type="submit" className="btn-primary w-full mt-6" disabled={loading || shippingLoading || !form.city}>
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

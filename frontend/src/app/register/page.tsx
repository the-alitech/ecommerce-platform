'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '';
  }
  return next;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get('next'));
  const loginHref = nextPath
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : '/login';

  const [form, setForm] = useState({
    email: '', username: '', password: '', password_confirm: '',
    first_name: '', last_name: '', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.register(form);
      const params = new URLSearchParams({ email: form.email });
      if (nextPath) params.set('next', nextPath);
      router.push(`/verify-otp?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center">
        <p className="section-label">Join Us</p>
        <h1 className="section-title mt-2">Create Account</h1>
        <div className="divider-accent mx-auto mt-4" />
        {nextPath === '/checkout' && (
          <p className="mt-3 text-sm text-brand-600">
            Create an account to complete your order.
          </p>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-8 card p-8 space-y-4 shadow-card">
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="First Name" className="input-field" required
            value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <input placeholder="Last Name" className="input-field" required
            value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
        </div>
        <input type="email" placeholder="Email" className="input-field" required
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Username" className="input-field" required
          value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input placeholder="Phone" className="input-field"
          value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input type="password" placeholder="Password" className="input-field" required
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <input type="password" placeholder="Confirm Password" className="input-field" required
          value={form.password_confirm} onChange={(e) => setForm({ ...form, password_confirm: e.target.value })} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>
        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link href={loginHref} className="font-medium hover:underline">Sign In</Link>
        </p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

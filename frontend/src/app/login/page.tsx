'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/account';
  }
  return next;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const nextPath = safeNextPath(searchParams.get('next'));
  const registerHref = nextPath !== '/account'
    ? `/register?next=${encodeURIComponent(nextPath)}`
    : '/register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('refresh_token', data.refresh);
      setAuth(data.user, data.access);
      router.push(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center">
        <p className="section-label">Welcome Back</p>
        <h1 className="section-title mt-2">Sign In</h1>
        <div className="divider-accent mx-auto mt-4" />
        {nextPath === '/checkout' && (
          <p className="mt-3 text-sm text-brand-600">
            Sign in to complete your order.
          </p>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-8 card p-8 space-y-4 shadow-card">
        <input type="email" placeholder="Email" className="input-field" required
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="input-field" required
          value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <div className="text-center text-sm space-y-2">
          <Link href="/forgot-password" className="text-brand-600 hover:underline">Forgot password?</Link>
          <p>Don&apos;t have an account? <Link href={registerHref} className="font-medium hover:underline">Register</Link></p>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nextPath = searchParams.get('next');
  const loginHref = nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : '/login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.verifyOtp(email, otp);
      router.push(loginHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 card p-8 space-y-4 max-w-md mx-auto">
      <input type="email" placeholder="Email" className="input-field" required
        value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="6-digit OTP" className="input-field" required maxLength={6}
        value={otp} onChange={(e) => setOtp(e.target.value)} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify Email'}
      </button>
      <p className="text-center text-sm"><Link href={loginHref} className="underline">Back to login</Link></p>
    </form>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="px-4 py-16">
      <h1 className="section-title text-center">Verify Email</h1>
      <Suspense fallback={<p className="text-center mt-8">Loading...</p>}>
        <VerifyOtpForm />
      </Suspense>
    </div>
  );
}

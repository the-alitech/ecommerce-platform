'use client';

import { useState } from 'react';
import { Mail, Sparkles } from 'lucide-react';
import { contentApi } from '@/lib/api';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await contentApi.newsletter(email);
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="py-20">
      <AnimateOnScroll animation="scale-in" className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-hero-mesh bg-[length:200%_200%] p-10 text-center shadow-glow motion-safe:animate-gradient-shift md:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.2)_0%,_transparent_70%)]" />
          <div className="hero-orb left-1/4 top-1/4 h-40 w-40 bg-accent-500/20" />
          <div className="hero-orb right-1/4 bottom-1/4 h-32 w-32 bg-rose-500/15 motion-safe:animate-float-slow" />
          <div className="relative">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm motion-safe:animate-pulse-soft">
              <Sparkles className="h-5 w-5 text-accent-300" />
            </div>
            <h2 className="mt-5 font-display text-3xl font-bold text-white md:text-4xl">Stay in Style</h2>
            <p className="mx-auto mt-3 max-w-md text-brand-300">
              Get exclusive offers, new arrivals, and styling tips delivered to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-full border border-white/10 bg-white/10 py-3.5 pl-11 pr-4 text-sm text-white placeholder-brand-400 backdrop-blur-sm focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                  required
                />
              </div>
              <button type="submit" className="btn-primary shrink-0" disabled={status === 'loading'}>
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {status === 'success' && <p className="mt-4 text-sm text-accent-300">Welcome to the club! Check your inbox.</p>}
            {status === 'error' && <p className="mt-4 text-sm text-rose-400">Something went wrong. Please try again.</p>}
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}

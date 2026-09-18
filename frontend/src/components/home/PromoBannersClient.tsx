'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import type { Banner } from '@/lib/api';

export function PromoBannersClient({ items }: { items: Banner[] }) {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((banner, i) => (
            <AnimateOnScroll
              key={banner.id}
              animation={i === 0 ? 'slide-right' : 'slide-left'}
              delay={i * 120}
            >
              <Link
                href={banner.link || '/shop'}
                className="group relative block overflow-hidden rounded-2xl aspect-[16/7] shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-glow"
              >
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  unoptimized
                  className="object-cover transition duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-950/85 via-brand-950/40 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-10">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-300 transition-transform duration-500 group-hover:translate-x-1">
                    Limited Time
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold text-white transition-transform duration-500 group-hover:translate-x-1 md:text-3xl">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="mt-2 max-w-xs text-sm text-brand-200 transition-transform duration-500 group-hover:translate-x-1 md:text-base">
                      {banner.subtitle}
                    </p>
                  )}
                  <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 group-hover:translate-x-1 group-hover:bg-accent-gradient group-hover:shadow-glow-sm">
                    Shop Now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

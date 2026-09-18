'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { Banner } from '@/lib/api';
import { normalizeList } from '@/lib/api';

const DEFAULT_SLIDES: Banner[] = [
  {
    id: 1,
    title: 'New Season Collection',
    subtitle: 'Discover premium fashion crafted for every occasion',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b241748a59?w=1920&h=1080&fit=crop&q=85',
    link: '/shop',
  },
  {
    id: 2,
    title: 'Step Into Style',
    subtitle: 'Premium footwear — up to 30% off selected shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&h=1080&fit=crop&q=85',
    link: '/shop/shoes',
  },
  {
    id: 3,
    title: 'Elevate Your Wardrobe',
    subtitle: 'Curated shirts, trousers & accessories for the modern you',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1920&h=1080&fit=crop&q=85',
    link: '/shop/shirts',
  },
];

export function HeroSlider({ banners }: { banners?: Banner[] | unknown }) {
  const list = normalizeList<Banner>(banners as Banner[] | { results: Banner[] });
  const apiSlides = list.filter((b) => b?.image);
  const slides = apiSlides.length ? apiSlides : DEFAULT_SLIDES;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-[68vh] min-h-[440px] max-h-[760px] overflow-hidden bg-brand-950">
      <div className="hero-orb left-[10%] top-[20%] h-64 w-64 bg-accent-500/20" style={{ animationDelay: '0s' }} />
      <div className="hero-orb right-[15%] top-[30%] h-48 w-48 bg-rose-500/15 motion-safe:animate-float-slow" style={{ animationDelay: '2s' }} />
      <div className="hero-orb bottom-[20%] left-[40%] h-32 w-32 bg-accent-400/10 motion-safe:animate-pulse-soft" />

      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            i === current ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className={`object-cover object-center transition-transform duration-[8000ms] ease-out ${
              i === current ? 'scale-110' : 'scale-100'
            }`}
            priority={i === 0}
            unoptimized
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950/92 via-brand-950/55 to-brand-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,_rgba(124,58,237,0.2)_0%,_transparent_55%)]" />

          <div className="relative z-10 flex h-full items-center">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className={`max-w-2xl transition-all duration-700 delay-100 ${
                i === current ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                <p className="section-label text-accent-300 motion-safe:animate-fade-in">Premium Fashion 2026</p>
                <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] text-white md:text-6xl lg:text-7xl drop-shadow-lg motion-safe:animate-fade-up">
                  {slide.title}
                </h1>
                {slide.subtitle && (
                  <p className="mt-5 max-w-lg text-lg text-brand-200/90 md:text-xl">{slide.subtitle}</p>
                )}
                <div className="mt-8 flex flex-wrap gap-4 motion-safe:animate-fade-up" style={{ animationDelay: '200ms' }}>
                  <Link href={slide.link || '/shop'} className="btn-primary gap-2 group">
                    Shop Now <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/categories"
                    className="btn-secondary !border-white/25 !bg-white/10 !text-white hover:!bg-white/20"
                  >
                    Browse Categories
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/20 p-3 text-white backdrop-blur-md transition hover:bg-white/20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => setCurrent((c) => (c + 1) % slides.length)}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/20 p-3 text-white backdrop-blur-md transition hover:bg-white/20"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-10 bg-accent-gradient shadow-glow-sm' : 'w-1.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import type { Product } from '@/lib/api';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
}

export function ProductSection({ title, subtitle, products, viewAllHref }: ProductSectionProps) {
  if (!products?.length) return null;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll animation="fade-up">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="divider-accent mb-4 animate-shimmer-line h-1 w-16 rounded-full" />
              <h2 className="section-title">{title}</h2>
              {subtitle && <p className="section-subtitle">{subtitle}</p>}
            </div>
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="group hidden sm:inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-300 hover:text-accent-600 hover:shadow-glow-sm"
              >
                View All
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </AnimateOnScroll>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((product, i) => (
            <AnimateOnScroll key={product.id} animation="scale-in" delay={i * 80} duration={550}>
              <ProductCard product={product} index={i} />
            </AnimateOnScroll>
          ))}
        </div>

        {viewAllHref && (
          <AnimateOnScroll animation="fade-in" delay={200} className="mt-8 text-center sm:hidden">
            <Link href={viewAllHref} className="btn-secondary">View All</Link>
          </AnimateOnScroll>
        )}
      </div>
    </section>
  );
}

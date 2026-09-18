'use client';

import { Star, Quote } from 'lucide-react';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import type { Testimonial } from '@/lib/api';

const defaultTestimonials: Testimonial[] = [
  { id: 1, name: 'Ayesha Khan', role: 'Fashion Blogger', content: 'Amazing quality and fast delivery! My go-to fashion store.', rating: 5, image: null },
  { id: 2, name: 'Ahmed Ali', role: 'Regular Customer', content: 'Best shoes collection in Pakistan. Highly recommended!', rating: 5, image: null },
  { id: 3, name: 'Sara Malik', role: 'Style Enthusiast', content: 'Love the premium shirts. Great prices and excellent service.', rating: 4, image: null },
];

export function Testimonials({ testimonials }: { testimonials?: Testimonial[] }) {
  const items = testimonials?.length ? testimonials : defaultTestimonials;

  return (
    <section className="py-20 bg-gradient-to-b from-brand-100/60 to-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll animation="fade-up" className="text-center">
          <p className="section-label">Testimonials</p>
          <h2 className="section-title mt-2">Loved by Our Customers</h2>
          <div className="divider-accent mx-auto mt-4" />
        </AnimateOnScroll>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <AnimateOnScroll key={t.id} animation="fade-up" delay={i * 120} duration={600}>
              <div className="card-hover group relative h-full p-7 transition-all duration-500 hover:-translate-y-1">
                <Quote className="absolute right-6 top-6 h-8 w-8 text-accent-100 transition-transform duration-500 group-hover:scale-110 group-hover:text-accent-200" />
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`h-4 w-4 transition-transform duration-300 motion-safe:group-hover:scale-110 ${
                        j < t.rating ? 'fill-gold-400 text-gold-400' : 'text-brand-200'
                      }`}
                      style={{ transitionDelay: `${j * 40}ms` }}
                    />
                  ))}
                </div>
                <p className="mt-5 text-brand-600 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3 border-t border-brand-100 pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-gradient text-sm font-bold text-white transition-transform duration-300 group-hover:scale-110">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-900">{t.name}</p>
                    <p className="text-sm text-brand-500">{t.role}</p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

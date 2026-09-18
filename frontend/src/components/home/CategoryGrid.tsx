'use client';

import { CategoryCard, type CategoryCardData } from '@/components/categories/CategoryCard';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import type { Category } from '@/lib/api';

const defaultCategories: CategoryCardData[] = [
  { slug: 'shoes', name: 'Shoes', icon: '👟', product_count: 0 },
  { slug: 'shirts', name: 'Shirts', icon: '👔', product_count: 0 },
  { slug: 'trousers', name: 'Trousers', icon: '👖', product_count: 0 },
  { slug: 'bags', name: 'Bags', icon: '👜', product_count: 0 },
];

export function CategoryGrid({ categories }: { categories?: Category[] }) {
  const items: CategoryCardData[] = categories?.length
    ? categories.map((c) => ({
        slug: c.slug,
        name: c.name,
        icon: c.icon,
        description: c.description,
        product_count: c.product_count,
      }))
    : defaultCategories;

  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll animation="blur-up">
          <div className="flex flex-col items-center text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
            <div>
              <p className="section-label">Collections</p>
              <h2 className="section-title mt-2">
                {items.length === 1 ? items[0].name : 'Shop by Category'}
              </h2>
              <div className="divider-accent mt-4 lg:mx-0" />
            </div>
            <p className="section-subtitle mt-4 max-w-md lg:mt-0 lg:text-right">
              {items.length === 1
                ? `Explore our full ${items[0].name.toLowerCase()} collection — new styles added regularly`
                : 'Curated edits for every style — from everyday essentials to statement pieces'}
            </p>
          </div>
        </AnimateOnScroll>

        <div
          className={
            items.length === 1
              ? 'mt-12 max-w-2xl mx-auto'
              : 'mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2 lg:gap-5'
          }
        >
          {items.map((cat, i) => (
            <AnimateOnScroll
              key={cat.slug}
              animation="scale-in"
              delay={i * 100}
              duration={650}
              className={
                items.length > 1 && i === 0
                  ? 'col-span-2 row-span-2 lg:col-span-2 lg:row-span-2'
                  : ''
              }
            >
              <CategoryCard
                category={cat}
                variant={items.length === 1 || i === 0 ? 'featured' : 'default'}
                index={i}
              />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

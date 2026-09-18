import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getCategoryStyle } from '@/lib/category-styles';

export interface CategoryCardData {
  slug: string;
  name: string;
  icon?: string;
  description?: string;
  product_count?: number;
}

interface CategoryCardProps {
  category: CategoryCardData;
  variant?: 'default' | 'featured';
  index?: number;
}

export function CategoryCard({ category, variant = 'default', index = 0 }: CategoryCardProps) {
  const style = getCategoryStyle(category.slug);
  const isFeatured = variant === 'featured';

  return (
    <Link
      href={`/shop/${category.slug}`}
      className={`category-card group relative overflow-hidden ${
        isFeatured ? 'category-card-featured' : 'category-card-default'
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Image
        src={style.image}
        alt={category.name}
        fill
        unoptimized
        className="object-cover transition duration-700 ease-out group-hover:scale-110"
        sizes={isFeatured ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
      />

      {/* Color wash */}
      <div className={`absolute inset-0 bg-gradient-to-t ${style.gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />

      {/* Shine on hover */}
      <div className="absolute -inset-full top-0 z-10 block w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition duration-700 group-hover:animate-[shimmer_1.2s_ease-out] group-hover:opacity-100" />

      {/* Top accent line */}
      <div className={`absolute left-0 top-0 h-1 w-0 bg-gradient-to-r ${style.accent} transition-all duration-500 group-hover:w-full`} />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
        <div className="translate-y-2 transition duration-500 group-hover:translate-y-0">
          {category.icon && !isFeatured && (
            <span className="mb-2 inline-block text-2xl drop-shadow-lg md:hidden">{category.icon}</span>
          )}

          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">
            {style.tagline}
          </p>
          <h3 className={`mt-1 font-display font-semibold text-white drop-shadow-md ${
            isFeatured ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-xl md:text-2xl'
          }`}>
            {category.name}
          </h3>

          {category.description && isFeatured && (
            <p className="mt-2 max-w-xs text-sm text-white/75 line-clamp-2">{category.description}</p>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {category.product_count != null && category.product_count > 0 && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  {category.product_count} items
                </span>
              )}
              <span className={`hidden rounded-full bg-gradient-to-r ${style.accent} px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white sm:inline-block`}>
                Trending
              </span>
            </div>

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-900 shadow-lg transition duration-300 group-hover:bg-accent-gradient group-hover:text-white group-hover:shadow-glow-sm">
              <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

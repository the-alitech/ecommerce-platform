'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import type { Product } from '@/lib/api';
import { formatPrice, getProductImageUrl } from '@/lib/api';

interface ProductCardProps {
  product: Product;
  onWishlist?: (id: number) => void;
  variant?: 'grid' | 'list';
  index?: number;
}

function getRating(product: Product): number {
  const base = 4 + (product.id % 10) / 10;
  return Math.min(5, Math.round(base * 10) / 10);
}

export function ProductCard({ product, onWishlist, variant = 'grid', index = 0 }: ProductCardProps) {
  const imageUrl = getProductImageUrl(product);
  const rating = getRating(product);
  const savings =
    product.compare_price && parseFloat(product.compare_price) > parseFloat(product.base_price)
      ? parseFloat(product.compare_price) - parseFloat(product.base_price)
      : 0;

  if (variant === 'list') {
    return (
      <div className="product-card-list group">
        <Link href={`/products/${product.slug}`} className="relative block w-36 shrink-0 overflow-hidden sm:w-44">
          <div className="aspect-[3/4] relative bg-brand-100">
            <Image src={imageUrl} alt={product.name} fill unoptimized className="object-cover transition duration-500 group-hover:scale-105" />
          </div>
        </Link>
        <div className="flex flex-1 flex-col justify-center p-4 sm:p-5">
          {product.brand && (
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-600">{product.brand.name}</p>
          )}
          <Link href={`/products/${product.slug}`}>
            <h3 className="mt-1 font-medium text-brand-900 transition hover:text-accent-700 sm:text-lg">{product.name}</h3>
          </Link>
          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-gold-400 text-gold-400' : 'text-brand-200'}`} />
            ))}
            <span className="ml-1 text-xs text-brand-500">({product.sales_count || 12})</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-lg font-bold text-brand-950">{formatPrice(product.base_price)}</span>
            {product.compare_price && (
              <span className="text-sm text-brand-400 line-through">{formatPrice(product.compare_price)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 self-center p-4">
          <Link href={`/products/${product.slug}`} className="btn-primary !px-5 !py-2.5 text-xs">
            View
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-card group" style={{ animationDelay: `${index * 60}ms` }}>
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden bg-brand-100">
        <div className="aspect-[3/4] relative">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            unoptimized
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.08]"
            sizes="(max-width: 768px) 50vw, 25vw"
            loading="lazy"
          />

          {/* Soft vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 via-transparent to-brand-950/5 opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.discount_percentage > 0 ? (
              <span className="badge-sale shadow-md">-{product.discount_percentage}% OFF</span>
            ) : product.is_new_arrival ? (
              <span className="rounded-full bg-accent-gradient px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-glow-sm">
                New In
              </span>
            ) : null}
            {product.is_bestseller && (
              <span className="rounded-full bg-brand-950/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-400 backdrop-blur-sm">
                Bestseller
              </span>
            )}
            {product.is_trending && !product.is_bestseller && (
              <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-700">
                Trending
              </span>
            )}
          </div>

          {!product.in_stock && (
            <div className="absolute inset-0 flex items-center justify-center bg-brand-950/40 backdrop-blur-[2px]">
              <span className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-900">
                Sold Out
              </span>
            </div>
          )}

          {/* Hover action bar */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
            <div className="flex items-center justify-between gap-2 bg-white/95 p-2.5 backdrop-blur-md">
              <span className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-950 py-2.5 text-xs font-semibold text-white transition hover:bg-accent-600">
                <Eye className="h-3.5 w-3.5" /> Quick View
              </span>
              {onWishlist && (
                <button
                  onClick={(e) => { e.preventDefault(); onWishlist(product.id); }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
                  aria-label="Wishlist"
                >
                  <Heart className="h-4 w-4" />
                </button>
              )}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-gradient text-white shadow-glow-sm">
                <ShoppingBag className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 pt-3.5">
        <div className="flex items-start justify-between gap-2">
          {product.brand ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-600">
              {product.brand.name}
            </p>
          ) : <span />}
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
            <span className="text-xs font-semibold text-brand-700">{rating}</span>
          </div>
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-1.5 font-medium leading-snug text-brand-900 line-clamp-2 transition-colors group-hover:text-accent-700">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-brand-950">{formatPrice(product.base_price)}</span>
              {product.compare_price && (
                <span className="text-sm text-brand-400 line-through">{formatPrice(product.compare_price)}</span>
              )}
            </div>
            {savings > 0 && (
              <p className="mt-0.5 text-[11px] font-semibold text-emerald-600">
                Save {formatPrice(savings)}
              </p>
            )}
          </div>
          {product.in_stock && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              In Stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/shop/ProductFilters';
import { AnimateOnScroll } from '@/components/ui/AnimateOnScroll';
import { productsApi, categoriesApi, normalizeList, type Product, type CategoryDetail, type ProductFacets } from '@/lib/api';

const FILTER_KEYS = [
  'min_price', 'max_price', 'brand', 'color', 'size', 'material',
  'gender', 'fabric', 'sleeve_type', 'waist_size', 'length', 'in_stock',
  'is_featured', 'is_new_arrival', 'is_bestseller', 'is_trending',
];

function parseFiltersFromSearchParams(searchParams: URLSearchParams): Record<string, string> {
  const initial: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (!['category', 'page'].includes(key) && value) {
      initial[key] = value;
    }
  });
  return initial;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [facets, setFacets] = useState<ProductFacets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState('-created_at');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  const categorySlug = (params?.category as string) || searchParams.get('category') || '';

  // Reset filters when category or URL query changes (fixes stale filters from previous category)
  useEffect(() => {
    setFilters(parseFiltersFromSearchParams(searchParams));
    setPage(1);
  }, [categorySlug, searchParams]);

  useEffect(() => {
    setSearch('');
    setPage(1);
  }, [categorySlug]);

  useEffect(() => {
    if (categorySlug) {
      categoriesApi.detail(categorySlug)
        .then(setCategory)
        .catch(() => setCategory(null));
    } else {
      setCategory(null);
    }
    productsApi.facets(categorySlug || undefined)
      .then(setFacets)
      .catch(() => setFacets(null));
  }, [categorySlug]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const apiFilters: Record<string, string> = {
        ordering: sort,
        page: String(page),
      };
      if (categorySlug) {
        apiFilters.category = categorySlug;
      }
      if (search.trim()) {
        apiFilters.search = search.trim();
      }
      FILTER_KEYS.forEach((key) => {
        if (filters[key]) {
          apiFilters[key] = filters[key];
        }
      });

      const data = await productsApi.list(apiFilters);
      const list = normalizeList<Product>(data);
      setProducts(list);
      setTotalCount('count' in data && typeof data.count === 'number' ? data.count : list.length);
      setTotalPages(Math.ceil(('count' in data && data.count ? data.count : list.length) / 12) || 1);
    } catch (err) {
      setProducts([]);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [filters, sort, page, categorySlug, search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AnimateOnScroll animation="fade-up" className="mb-10">
        <p className="section-label">Browse</p>
        <h1 className="section-title mt-2">{category?.name || 'Shop All'}</h1>
        <div className="divider-accent mt-4 animate-shimmer-line h-1 w-16 rounded-full" />
        {category?.description && <p className="section-subtitle mt-3">{category.description}</p>}
        {!loading && (
          <p className="mt-2 text-sm text-brand-500">
            {totalCount} {totalCount === 1 ? 'product' : 'products'} found
            {categorySlug ? ` in ${category?.name || categorySlug}` : ''}
          </p>
        )}
      </AnimateOnScroll>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className={`lg:w-64 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="card p-6 sticky top-24">
            <ProductFilters
              filters={category?.filter_definitions || []}
              facets={facets}
              activeFilters={filters}
              onFilterChange={handleFilterChange}
              onClear={clearFilters}
            />
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field max-w-xs"
            />
            <div className="flex items-center gap-4">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field w-auto">
                <option value="-created_at">Newest</option>
                <option value="base_price">Price: Low to High</option>
                <option value="-base_price">Price: High to Low</option>
                <option value="-sales_count">Best Selling</option>
                <option value="name">Name A-Z</option>
              </select>
              <div className="flex rounded-md border border-brand-200">
                <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-brand-100' : ''}`}>
                  <Grid className="h-4 w-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-brand-100' : ''}`}>
                  <List className="h-4 w-4" />
                </button>
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden btn-secondary py-2 px-3">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl ring-1 ring-brand-100 motion-safe:animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="aspect-[3/4] skeleton-shine" />
                  <div className="space-y-2 p-4">
                    <div className="h-2 w-16 skeleton-shine rounded" />
                    <div className="h-3 w-full skeleton-shine rounded" />
                    <div className="h-4 w-20 skeleton-shine rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-brand-500">No products found.</p>
              {Object.keys(filters).length > 0 && (
                <button onClick={clearFilters} className="btn-secondary mt-4">Clear Filters</button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6' : 'space-y-4'}>
              {products.map((p, i) => (
                <AnimateOnScroll key={p.id} animation="fade-up" delay={(i % 12) * 60} duration={500}>
                  <ProductCard product={p} variant={viewMode === 'list' ? 'list' : 'grid'} index={i} />
                </AnimateOnScroll>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${page === i + 1 ? 'bg-accent-gradient text-white shadow-glow-sm' : 'bg-brand-100 text-brand-700 hover:bg-brand-200'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ShopPageClient() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}

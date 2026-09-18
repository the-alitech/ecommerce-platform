import { HeroSlider } from '@/components/home/HeroSlider';
import { PromoBanners } from '@/components/home/PromoBanners';
import { ProductSection } from '@/components/home/ProductSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { Testimonials } from '@/components/home/Testimonials';
import { Newsletter } from '@/components/home/Newsletter';
import { normalizeList, type Banner, type Category, type Product } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2000/api';

async function fetchData<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function shopHref(category: Category | null, query: string) {
  if (category) {
    return `/shop/${category.slug}?${query}`;
  }
  return `/shop?${query}`;
}

export default async function HomePage() {
  const [banners, promoBanners, featured, newArrivals, bestSellers, trending, categories, testimonials] =
    await Promise.all([
      fetchData<unknown[]>('/content/banners/hero/'),
      fetchData<unknown[]>('/content/banners/promo/'),
      fetchData<unknown[]>('/products/featured/'),
      fetchData<unknown[]>('/products/new-arrivals/'),
      fetchData<unknown[]>('/products/best-sellers/'),
      fetchData<unknown[]>('/products/trending/'),
      fetchData<unknown[]>('/categories/'),
      fetchData<unknown[]>('/content/testimonials/'),
    ]);

  const heroBanners = normalizeList<Banner>(banners);
  const promoBannerList = normalizeList<Banner>(promoBanners);
  const categoryList = normalizeList<Category>(categories);
  const singleCategory = categoryList.length === 1 ? categoryList[0] : null;

  const upcomingEndpoint = singleCategory
    ? `/products/new-arrivals/?category=${singleCategory.slug}`
    : null;
  const upcoming = upcomingEndpoint ? await fetchData<unknown[]>(upcomingEndpoint) : null;

  const featuredList = normalizeList<Product>(featured);
  const newArrivalsList = normalizeList<Product>(newArrivals);
  const upcomingList = normalizeList<Product>(upcoming);
  const bestSellersList = normalizeList<Product>(bestSellers);
  const trendingList = normalizeList<Product>(trending);
  const testimonialList = normalizeList(testimonials);

  return (
    <>
      <HeroSlider banners={heroBanners} />
      <CategoryGrid categories={categoryList} />
      <PromoBanners banners={promoBannerList} />

      {singleCategory ? (
        <ProductSection
          title={`Upcoming ${singleCategory.name} Products`}
          subtitle={`Fresh ${singleCategory.name.toLowerCase()} styles arriving soon — shop the latest drops`}
          products={upcomingList.length ? upcomingList : newArrivalsList}
          viewAllHref={shopHref(singleCategory, 'is_new_arrival=true')}
        />
      ) : null}

      <ProductSection
        title="Featured Products"
        subtitle="Handpicked styles for you"
        products={featuredList}
        viewAllHref={shopHref(singleCategory, 'is_featured=true')}
      />

      {!singleCategory ? (
        <ProductSection
          title="New Arrivals"
          subtitle="Fresh styles just landed"
          products={newArrivalsList}
          viewAllHref="/shop?is_new_arrival=true"
        />
      ) : null}

      <ProductSection
        title="Best Sellers"
        products={bestSellersList}
        viewAllHref={shopHref(singleCategory, 'is_bestseller=true')}
      />
      <ProductSection
        title="Trending Now"
        products={trendingList}
        viewAllHref={shopHref(singleCategory, 'is_trending=true')}
      />
      <Testimonials testimonials={testimonialList} />
      <Newsletter />
    </>
  );
}

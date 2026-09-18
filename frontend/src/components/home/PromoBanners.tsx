import type { Banner } from '@/lib/api';
import { normalizeList } from '@/lib/api';
import { PromoBannersClient } from './PromoBannersClient';

const FALLBACK_PROMOS: Banner[] = [
  {
    id: 1,
    title: 'Summer Sale',
    subtitle: 'Fresh styles for the season',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=700&fit=crop&q=85',
    link: '/shop?is_new_arrival=true',
  },
  {
    id: 2,
    title: 'Best Sellers',
    subtitle: 'Most loved by our customers',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=700&fit=crop&q=85',
    link: '/shop?is_bestseller=true',
  },
];

export function PromoBanners({ banners }: { banners?: Banner[] | unknown }) {
  const list = normalizeList<Banner>(banners as Banner[] | { results: Banner[] });
  const withImages = list.filter((b) => b?.image);
  const items = withImages.length ? withImages : FALLBACK_PROMOS;

  return <PromoBannersClient items={items.slice(0, 2)} />;
}

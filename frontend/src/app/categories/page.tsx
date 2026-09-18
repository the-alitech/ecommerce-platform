import { CategoryCard } from '@/components/categories/CategoryCard';
import { normalizeList, type Category } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2000/api';

async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories/`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const fallback = [
  { slug: 'shoes', name: 'Shoes', icon: '👟', description: 'Premium footwear for every step', product_count: 0 },
  { slug: 'shirts', name: 'Shirts', icon: '👔', description: 'From casual to formal excellence', product_count: 0 },
  { slug: 'trousers', name: 'Trousers', icon: '👖', description: 'Tailored comfort & style', product_count: 0 },
  { slug: 'bags', name: 'Bags', icon: '👜', description: 'Statement accessories', product_count: 0 },
];

export default async function CategoriesPage() {
  const raw = await getCategories();
  const categories = normalizeList<Category>(raw);
  const items = categories.length ? categories : fallback;

  return (
    <div className="pb-20">
      {/* Page header */}
      <div className="bg-hero-mesh py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <p className="section-label !text-accent-300">Browse</p>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">All Categories</h1>
          <p className="mt-4 text-brand-300">Discover our complete fashion collection</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:grid-rows-2 lg:gap-6">
          {items.map((cat, i) => (
            <div key={cat.slug} className={i === 0 ? 'col-span-2 row-span-2 lg:col-span-2 lg:row-span-2' : ''}>
              <CategoryCard
                category={{
                  slug: cat.slug,
                  name: cat.name,
                  icon: cat.icon,
                  description: cat.description,
                  product_count: cat.product_count,
                }}
                variant={i === 0 ? 'featured' : 'default'}
                index={i}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

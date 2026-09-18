export interface CategoryStyle {
  image: string;
  gradient: string;
  accent: string;
  tagline: string;
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  shoes: {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop&q=85',
    gradient: 'from-violet-950/80 via-violet-900/40 to-transparent',
    accent: 'from-violet-500 to-indigo-600',
    tagline: 'Step into style',
  },
  shirts: {
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1000&fit=crop&q=85',
    gradient: 'from-rose-950/80 via-rose-900/35 to-transparent',
    accent: 'from-rose-500 to-pink-600',
    tagline: 'Elevate your look',
  },
  trousers: {
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1000&fit=crop&q=85',
    gradient: 'from-brand-950/85 via-brand-900/40 to-transparent',
    accent: 'from-slate-500 to-brand-800',
    tagline: 'Perfect fit',
  },
  bags: {
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop&q=85',
    gradient: 'from-amber-950/80 via-orange-900/35 to-transparent',
    accent: 'from-amber-500 to-orange-600',
    tagline: 'Carry in luxury',
  },
};

export const DEFAULT_CATEGORY_STYLE: CategoryStyle = {
  image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=1000&fit=crop&q=85',
  gradient: 'from-brand-950/85 via-accent-900/40 to-transparent',
  accent: 'from-accent-500 to-violet-600',
  tagline: 'Explore collection',
};

export function getCategoryStyle(slug: string): CategoryStyle {
  return CATEGORY_STYLES[slug] || DEFAULT_CATEGORY_STYLE;
}

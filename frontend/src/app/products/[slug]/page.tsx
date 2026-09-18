import { ProductDetailClient } from './ProductDetailClient';
import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2000/api';

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}/`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.short_description,
    openGraph: {
      title: product.name,
      description: product.short_description,
      images: product.images?.[0]?.image ? [product.images[0].image] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return <ProductDetailClient slug={slug} initialProduct={product} />;
}

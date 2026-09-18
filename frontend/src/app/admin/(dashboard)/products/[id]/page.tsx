'use client';

import { use } from 'react';
import ProductForm from '@/components/admin/ProductForm';

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const productId = Number(id);
  if (!productId) {
    return <div className="text-red-600">Invalid product id.</div>;
  }
  return <ProductForm productId={productId} />;
}

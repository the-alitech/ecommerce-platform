'use client';

import { BACKEND_URL } from '@/lib/api';

const actions = [
  {
    title: 'All Products',
    desc: 'Create, edit, delete products and upload images',
    href: `${BACKEND_URL}/admin/products/product/`,
  },
  {
    title: 'Add New Product',
    desc: 'Create a product with variants, sizes, colors, and stock',
    href: `${BACKEND_URL}/admin/products/product/add/`,
  },
  {
    title: 'Brands',
    desc: 'Manage Nike, Adidas, and other brands',
    href: `${BACKEND_URL}/admin/products/brand/`,
  },
  {
    title: 'Categories',
    desc: 'Shoes, shirts, trousers and category filters',
    href: `${BACKEND_URL}/admin/categories/category/`,
  },
];

export default function ProductsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Product Management</h1>
      <p className="mt-2 text-gray-600 max-w-2xl">
        Add products, variants, stock, and images from Django Admin. Changes show on the storefront right away.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {actions.map((action) => (
          <a
            key={action.title}
            href={action.href}
            target="_blank"
            rel="noopener"
            className="rounded-xl border bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <h2 className="font-semibold text-lg text-indigo-900">{action.title}</h2>
            <p className="mt-2 text-sm text-gray-600">{action.desc}</p>
            <span className="mt-4 inline-block text-sm font-medium text-indigo-600">Open →</span>
          </a>
        ))}
      </div>

      <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold mb-3">What you can manage</h2>
        <ul className="grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
          <li>• Product name, price, description, SKU</li>
          <li>• Variants (color, size, stock quantity)</li>
          <li>• Product images (main + per color)</li>
          <li>• Featured / new arrival / bestseller flags</li>
          <li>• Category & brand assignment</li>
          <li>• SEO title and meta description</li>
        </ul>
      </div>
    </div>
  );
}

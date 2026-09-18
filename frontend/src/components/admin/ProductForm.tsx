'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  adminApi,
  type AdminProductDetail,
  type AdminProductOptions,
  type AdminVariant,
  type AdminProductImage,
} from '@/lib/admin-api';
import { ArrowLeft, Plus, Trash2, Upload, ImageIcon } from 'lucide-react';

type VariantForm = {
  id?: number | null;
  sku: string;
  color: string;
  color_hex: string;
  size: string;
  stock_quantity: string;
  price: string;
  is_active: boolean;
};

const emptyVariant = (): VariantForm => ({
  id: null,
  sku: '',
  color: '',
  color_hex: '',
  size: '',
  stock_quantity: '0',
  price: '',
  is_active: true,
});

type FormState = {
  name: string;
  sku: string;
  description: string;
  short_description: string;
  base_price: string;
  compare_price: string;
  stock_quantity: string;
  category: string;
  brand: string;
  gender: string;
  material: string;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_trending: boolean;
  meta_title: string;
  meta_description: string;
};

const emptyForm = (): FormState => ({
  name: '',
  sku: '',
  description: '',
  short_description: '',
  base_price: '',
  compare_price: '',
  stock_quantity: '0',
  category: '',
  brand: '',
  gender: '',
  material: '',
  is_active: true,
  is_featured: false,
  is_new_arrival: false,
  is_bestseller: false,
  is_trending: false,
  meta_title: '',
  meta_description: '',
});

function toVariantForm(v: AdminVariant): VariantForm {
  return {
    id: v.id ?? null,
    sku: v.sku || '',
    color: v.color || '',
    color_hex: v.color_hex || '',
    size: v.size || '',
    stock_quantity: String(v.stock_quantity ?? 0),
    price: v.price != null ? String(v.price) : '',
    is_active: v.is_active !== false,
  };
}

type Props = {
  productId?: number;
};

export default function ProductForm({ productId }: Props) {
  const router = useRouter();
  const isEdit = Boolean(productId);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [variants, setVariants] = useState<VariantForm[]>([emptyVariant()]);
  const [images, setImages] = useState<AdminProductImage[]>([]);
  const [options, setOptions] = useState<AdminProductOptions | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [addingBrand, setAddingBrand] = useState(false);

  useEffect(() => {
    adminApi<AdminProductOptions>('/dashboard/products/options/')
      .then(setOptions)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load options'));
  }, []);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    adminApi<AdminProductDetail>(`/dashboard/products/${productId}/`)
      .then((product) => {
        setForm({
          name: product.name || '',
          sku: product.sku || '',
          description: product.description || '',
          short_description: product.short_description || '',
          base_price: String(product.base_price ?? ''),
          compare_price: product.compare_price != null ? String(product.compare_price) : '',
          stock_quantity: String(product.stock_quantity ?? 0),
          category: String(product.category || ''),
          brand: product.brand != null ? String(product.brand) : '',
          gender: product.gender || '',
          material: product.material || '',
          is_active: product.is_active,
          is_featured: product.is_featured,
          is_new_arrival: product.is_new_arrival,
          is_bestseller: product.is_bestseller,
          is_trending: product.is_trending,
          meta_title: product.meta_title || '',
          meta_description: product.meta_description || '',
        });
        setVariants(
          product.variants?.length ? product.variants.map(toVariantForm) : [emptyVariant()]
        );
        setImages(product.images || []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load product'))
      .finally(() => setLoading(false));
  }, [productId]);

  const updateVariant = (index: number, patch: Partial<VariantForm>) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const handleAddBrand = async () => {
    const name = newBrand.trim();
    if (!name) return;
    setAddingBrand(true);
    setError('');
    try {
      const brand = await adminApi<{ id: number; name: string; slug: string; is_active: boolean }>(
        '/dashboard/products/brands/',
        { method: 'POST', body: JSON.stringify({ name, is_active: true }) }
      );
      setOptions((prev) =>
        prev
          ? { ...prev, brands: [...prev.brands, brand].sort((a, b) => a.name.localeCompare(b.name)) }
          : prev
      );
      setForm((f) => ({ ...f, brand: String(brand.id) }));
      setNewBrand('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add brand');
    } finally {
      setAddingBrand(false);
    }
  };

  const buildPayload = () => {
    const variantPayload = variants
      .filter((v) => v.color || v.size || v.sku || Number(v.stock_quantity) > 0)
      .map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        sku: v.sku.trim(),
        color: v.color.trim(),
        color_hex: v.color_hex.trim(),
        size: v.size.trim(),
        waist_size: '',
        length: '',
        sleeve_type: '',
        fabric: '',
        price: v.price.trim() ? v.price.trim() : null,
        stock_quantity: Number(v.stock_quantity || 0),
        is_active: v.is_active,
      }));

    return {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim() || form.name.trim(),
      short_description: form.short_description.trim(),
      base_price: form.base_price,
      compare_price: form.compare_price.trim() ? form.compare_price.trim() : null,
      stock_quantity: Number(form.stock_quantity || 0),
      category: Number(form.category),
      brand: form.brand ? Number(form.brand) : null,
      gender: form.gender,
      material: form.material.trim(),
      is_active: form.is_active,
      is_featured: form.is_featured,
      is_new_arrival: form.is_new_arrival,
      is_bestseller: form.is_bestseller,
      is_trending: form.is_trending,
      meta_title: form.meta_title.trim(),
      meta_description: form.meta_description.trim(),
      variants: variantPayload,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) {
      setError('Please select a category.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = buildPayload();
      if (isEdit && productId) {
        await adminApi(`/dashboard/products/${productId}/`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        router.push('/admin/products');
      } else {
        const created = await adminApi<AdminProductDetail>('/dashboard/products/', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        router.push(`/admin/products/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File, isPrimary = false) => {
    if (!productId) {
      setError('Save the product first, then upload images.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const body = new FormData();
      body.append('image', file);
      body.append('is_primary', isPrimary ? 'true' : 'false');
      body.append('alt_text', form.name || file.name);
      const img = await adminApi<AdminProductImage>(`/dashboard/products/${productId}/images/`, {
        method: 'POST',
        body,
      });
      setImages((prev) => {
        const cleared =
          isPrimary || img.is_primary
            ? prev.map((i) => ({ ...i, is_primary: false }))
            : prev;
        return [...cleared.filter((i) => i.id !== img.id), img];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Delete this image?')) return;
    setError('');
    try {
      await adminApi(`/dashboard/products/images/${imageId}/`, { method: 'DELETE' });
      setImages((prev) => prev.filter((i) => i.id !== imageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading product…</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
        <h1 className="mt-3 text-2xl font-bold">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
        <p className="text-gray-600">
          Manage name, pricing, variants, stock, and images without Django Admin.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-lg">Basic info</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm text-gray-600">Product name</span>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-gray-600">SKU</span>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-gray-600">Gender</span>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="">—</option>
                {(options?.genders || []).map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-gray-600">Category</span>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="">Select category</option>
                {(options?.categories || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-gray-600">Brand</span>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              >
                <option value="">No brand</option>
                {(options?.brands || []).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="sm:col-span-2 flex flex-wrap gap-2">
              <input
                className="min-w-[180px] flex-1 rounded-lg border px-3 py-2 text-sm"
                placeholder="Quick-add brand name"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddBrand}
                disabled={addingBrand || !newBrand.trim()}
                className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
              >
                {addingBrand ? 'Adding…' : 'Add brand'}
              </button>
            </div>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm text-gray-600">Short description</span>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm text-gray-600">Full description</span>
              <textarea
                className="w-full rounded-lg border px-3 py-2 min-h-[120px]"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-gray-600">Material</span>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
              />
            </label>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-lg">Pricing & stock</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-sm text-gray-600">Base price (PKR)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-lg border px-3 py-2"
                value={form.base_price}
                onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-gray-600">Compare-at price</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-lg border px-3 py-2"
                value={form.compare_price}
                onChange={(e) => setForm({ ...form, compare_price: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-gray-600">Base stock (no variants)</span>
              <input
                type="number"
                min="0"
                className="w-full rounded-lg border px-3 py-2"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
              />
            </label>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-lg">Variants (size / color / stock)</h2>
            <button
              type="button"
              onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Add variant
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {variants.map((variant, index) => (
              <div
                key={variant.id ?? `new-${index}`}
                className="grid gap-2 rounded-lg border bg-gray-50 p-3 sm:grid-cols-6"
              >
                <input
                  className="rounded-lg border bg-white px-2 py-1.5 text-sm"
                  placeholder="Color"
                  value={variant.color}
                  onChange={(e) => updateVariant(index, { color: e.target.value })}
                />
                <input
                  className="rounded-lg border bg-white px-2 py-1.5 text-sm"
                  placeholder="#hex"
                  value={variant.color_hex}
                  onChange={(e) => updateVariant(index, { color_hex: e.target.value })}
                />
                <input
                  className="rounded-lg border bg-white px-2 py-1.5 text-sm"
                  placeholder="Size"
                  value={variant.size}
                  onChange={(e) => updateVariant(index, { size: e.target.value })}
                />
                <input
                  type="number"
                  min="0"
                  className="rounded-lg border bg-white px-2 py-1.5 text-sm"
                  placeholder="Stock"
                  value={variant.stock_quantity}
                  onChange={(e) => updateVariant(index, { stock_quantity: e.target.value })}
                />
                <input
                  className="rounded-lg border bg-white px-2 py-1.5 text-sm"
                  placeholder="Variant SKU (optional)"
                  value={variant.sku}
                  onChange={(e) => updateVariant(index, { sku: e.target.value })}
                />
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={variant.is_active}
                      onChange={(e) => updateVariant(index, { is_active: e.target.checked })}
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    onClick={() => setVariants((prev) => prev.filter((_, i) => i !== index))}
                    className="rounded-lg border bg-white p-1.5 text-gray-500 hover:text-red-600"
                    title="Remove variant"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-lg">Visibility flags</h2>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {(
              [
                ['is_active', 'Active on store'],
                ['is_featured', 'Featured'],
                ['is_new_arrival', 'New arrival'],
                ['is_bestseller', 'Bestseller'],
                ['is_trending', 'Trending'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-lg">SEO (optional)</h2>
          <div className="mt-4 grid gap-4">
            <input
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Meta title"
              value={form.meta_title}
              onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
            />
            <textarea
              className="w-full rounded-lg border px-3 py-2 min-h-[80px]"
              placeholder="Meta description"
              value={form.meta_description}
              onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
            />
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-lg">Images</h2>
          {!isEdit ? (
            <p className="mt-2 text-sm text-gray-600">
              Save the product first, then you can upload images on the edit screen.
            </p>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm hover:bg-gray-50">
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading…' : 'Upload image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, images.length === 0);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {images.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed p-6 text-sm text-gray-500 sm:col-span-2">
                    <ImageIcon className="h-5 w-5" />
                    No images yet
                  </div>
                ) : (
                  images.map((img) => (
                    <div key={img.id} className="relative overflow-hidden rounded-lg border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.alt_text} className="h-36 w-full object-cover" />
                      <div className="flex items-center justify-between gap-2 border-t px-2 py-1.5 text-xs">
                        <span className={img.is_primary ? 'font-medium text-indigo-700' : 'text-gray-500'}>
                          {img.is_primary ? 'Primary' : 'Gallery'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
          </button>
          <Link
            href="/admin/products"
            className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

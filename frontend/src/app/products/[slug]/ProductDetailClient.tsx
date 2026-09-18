'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Minus, Plus, MessageCircle, ShoppingBag, Zap } from 'lucide-react';
import { productsApi, cartApi, wishlistApi, formatPrice, whatsappLink, type ProductDetail } from '@/lib/api';
import { getVariantColorHex, isLightColor } from '@/lib/colors';
import { getImagesForVariant } from '@/lib/product-images';
import { useCartStore, useAuthStore } from '@/lib/store';
import { ProductCard } from '@/components/products/ProductCard';

export function ProductDetailClient({
  slug,
  initialProduct,
}: {
  slug: string;
  initialProduct: ProductDetail | null;
}) {
  const [product, setProduct] = useState<ProductDetail | null>(initialProduct);
  const [selectedVariant, setSelectedVariant] = useState(initialProduct?.variants?.[0] || null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { setItemCount } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!initialProduct) {
      productsApi.detail(slug).then((p) => {
        setProduct(p);
        setSelectedVariant(p.variants?.[0] || null);
      });
    }
  }, [slug, initialProduct]);

  useEffect(() => {
    if (selectedVariant?.stock_quantity) {
      setQuantity((q) => Math.min(q, selectedVariant.stock_quantity));
    }
  }, [selectedVariant?.id, selectedVariant?.stock_quantity]);

  useEffect(() => {
    setSelectedImage(0);
  }, [selectedVariant?.id]);

  if (!product) {
    return <div className="py-20 text-center">Product not found.</div>;
  }

  const images = getImagesForVariant(product, selectedVariant);

  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))];
  const sizes = product.variants
    .filter((v) => !selectedVariant?.color || v.color === selectedVariant.color)
    .map((v) => v.size || v.waist_size)
    .filter(Boolean);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setLoading(true);
    try {
      const cart = await cartApi.add(selectedVariant.id, quantity);
      setItemCount(cart.total_items);
      setMessage('Added to cart!');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) { window.location.href = '/login'; return; }
    const result = await wishlistApi.toggle(product.id);
    setProduct({ ...product, is_wishlisted: result.wishlisted });
  };

  const waMessage = `Hello, I am interested in ${product.name}${selectedVariant?.color ? `, ${selectedVariant.color}` : ''}${selectedVariant?.size ? `, Size ${selectedVariant.size}` : ''}.`;
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923001234567';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: product.brand?.name,
    offers: {
      '@type': 'Offer',
      price: product.base_price,
      priceCurrency: 'PKR',
      availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-brand-500">
          <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> /
          <Link href={`/shop/${product.category?.slug || product.category_slug}`}> {product.category?.name || product.category_name}</Link> / {product.name}
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div
              className={`relative aspect-square overflow-hidden rounded-xl bg-brand-100 cursor-zoom-in ${zoomed ? 'cursor-zoom-out' : ''}`}
              onClick={() => setZoomed(!zoomed)}
            >
              <Image
                key={`${selectedVariant?.id || 'default'}-${images[selectedImage]?.id || selectedImage}`}
                src={images[selectedImage]?.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=800&fit=crop'}
                alt={images[selectedImage]?.alt_text || product.name}
                fill
                unoptimized
                className={`object-cover transition-all duration-500 ${zoomed ? 'scale-150' : 'animate-fade-in'}`}
                priority
              />
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg ${i === selectedImage ? 'ring-2 ring-brand-900' : ''}`}
                >
                  <Image src={img.image} alt="" fill unoptimized className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            {product.brand && <p className="text-sm font-medium uppercase tracking-wider text-brand-500">{product.brand.name}</p>}
            <h1 className="mt-2 font-display text-3xl font-bold text-brand-950">{product.name}</h1>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-bold">{formatPrice(selectedVariant?.effective_price || product.base_price)}</span>
              {product.compare_price && (
                <span className="text-lg text-brand-400 line-through">{formatPrice(product.compare_price)}</span>
              )}
            </div>
            <p className="mt-4 text-brand-600 leading-relaxed">{product.short_description}</p>

            {colors.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-brand-700">Color: {selectedVariant?.color}</p>
                <div className="mt-2 flex gap-2">
                  {colors.map((color) => {
                    const variant = product.variants.find((v) => v.color === color);
                    const swatchHex = getVariantColorHex(color, variant?.color_hex);
                    const light = isLightColor(swatchHex);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          if (variant) setSelectedVariant(variant);
                        }}
                        className={`h-9 w-9 rounded-full border-2 transition-transform duration-200 hover:scale-110 ${
                          selectedVariant?.color === color
                            ? 'border-brand-900 ring-2 ring-brand-900/20'
                            : light
                              ? 'border-brand-300'
                              : 'border-brand-200'
                        }`}
                        style={{ backgroundColor: swatchHex }}
                        title={color}
                        aria-label={`Color ${color}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-brand-700">Size</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const variant = product.variants.find(
                      (v) => (v.size === size || v.waist_size === size) &&
                        (!selectedVariant?.color || v.color === selectedVariant.color)
                    );
                    return (
                      <button
                        key={size}
                        onClick={() => variant && setSelectedVariant(variant)}
                        disabled={!variant?.in_stock}
                        className={`min-w-[3rem] rounded-md border px-3 py-2 text-sm ${
                          selectedVariant?.size === size || selectedVariant?.waist_size === size
                            ? 'border-brand-900 bg-brand-900 text-white'
                            : 'border-brand-200 hover:border-brand-400'
                        } ${!variant?.in_stock ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="mt-4 text-sm">
              {selectedVariant?.in_stock
                ? <span className="text-green-600">In Stock ({selectedVariant.stock_quantity} available)</span>
                : <span className="text-red-600">Out of Stock</span>}
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-md border border-brand-200">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3"><Minus className="h-4 w-4" /></button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant?.stock_quantity || 1, quantity + 1))}
                  disabled={!selectedVariant?.in_stock || quantity >= (selectedVariant?.stock_quantity || 1)}
                  className="p-3 disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={handleAddToCart} disabled={loading || !selectedVariant?.in_stock} className="btn-primary flex-1 gap-2">
                <ShoppingBag className="h-4 w-4" /> Add to Cart
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!user) {
                    window.location.href = '/login?next=/checkout';
                    return;
                  }
                  await handleAddToCart();
                  window.location.href = '/checkout';
                }}
                disabled={loading || !selectedVariant?.in_stock}
                className="btn-outline flex-1 gap-2"
              >
                <Zap className="h-4 w-4" /> Buy Now
              </button>
              <button onClick={handleWishlist} className="btn-secondary px-4">
                <Heart className={`h-4 w-4 ${product.is_wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>

            <a
              href={whatsappLink(waNumber, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 rounded-md bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 transition"
            >
              <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
            </a>

            {message && <p className="mt-4 text-sm text-brand-600">{message}</p>}

            <div className="mt-8 border-t border-brand-100 pt-8">
              <h3 className="font-semibold text-brand-900">Description</h3>
              <div className="mt-2 text-brand-600 prose prose-sm" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>

            {Object.keys(product.specifications || {}).length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-brand-900">Specifications</h3>
                <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key}>
                      <dt className="text-brand-500 capitalize">{key}</dt>
                      <dd className="font-medium text-brand-900">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {product.related_products?.length > 0 && (
          <section className="mt-16">
            <h2 className="section-title">Related Products</h2>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {product.related_products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

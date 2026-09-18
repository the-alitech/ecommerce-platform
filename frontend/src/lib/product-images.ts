import type { ProductDetail, ProductVariant } from '@/lib/api';
import { getProductImageUrl } from '@/lib/api';

export interface ProductGalleryImage {
  id: number;
  image: string;
  alt_text: string;
  is_primary?: boolean;
  variant?: number | null;
}

function matchesColor(image: ProductGalleryImage, color: string): boolean {
  const needle = color.trim().toLowerCase();
  if (!needle) return false;
  const haystack = `${image.image} ${image.alt_text || ''}`.toLowerCase();
  return haystack.includes(needle);
}

export function getImagesForVariant(
  product: ProductDetail,
  selectedVariant: ProductVariant | null
): ProductGalleryImage[] {
  const fallbackUrl = getProductImageUrl(product);
  const all: ProductGalleryImage[] = product.images?.length
    ? product.images.map((img) => ({
        id: img.id,
        image: img.image,
        alt_text: img.alt_text || product.name,
        is_primary: img.is_primary,
        variant: img.variant ?? null,
      }))
    : [{ id: 0, image: fallbackUrl, alt_text: product.name, is_primary: true, variant: null }];

  if (!selectedVariant) return all;

  const byVariantId = all.filter((img) => img.variant === selectedVariant.id);
  if (byVariantId.length) return byVariantId;

  if (selectedVariant.image) {
    const fromVariantField = all.filter((img) => img.image === selectedVariant.image);
    if (fromVariantField.length) return fromVariantField;
    return [{
      id: selectedVariant.id,
      image: selectedVariant.image,
      alt_text: `${product.name} - ${selectedVariant.color || ''}`.trim(),
      is_primary: true,
      variant: selectedVariant.id,
    }];
  }

  const color = selectedVariant.color || '';
  if (color) {
    const byColor = all.filter((img) => matchesColor(img, color));
    if (byColor.length) return byColor;
  }

  const generic = all.filter((img) => !img.variant);
  return generic.length ? generic : all;
}

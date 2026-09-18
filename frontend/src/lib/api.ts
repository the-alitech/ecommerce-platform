const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2000/api';

/** Browser uses same-origin /api proxy (next.config rewrites) to avoid CORS. */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return SERVER_API_URL;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

function parseError(error: Record<string, unknown>): string {
  if (typeof error.detail === 'string') return error.detail;
  if (typeof error.error === 'string') return error.error;
  if (typeof error.message === 'string') return error.message;
  for (const val of Object.values(error)) {
    if (Array.isArray(val) && val.length) return String(val[0]);
    if (typeof val === 'string') return val;
  }
  return 'Request failed';
}

export async function api<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const method = (options.method || 'GET').toUpperCase();
  const hasBody = options.body != null && options.body !== '';
  const headers: HeadersInit = { ...(options.headers || {}) };
  if (hasBody || ['POST', 'PUT', 'PATCH'].includes(method)) {
    (headers as Record<string, string>)['Content-Type'] =
      (headers as Record<string, string>)['Content-Type'] || 'application/json';
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(parseError(error as Record<string, unknown>));
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

export function normalizeList<T>(data: unknown): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (typeof data === 'object' && data !== null && 'results' in data) {
    const results = (data as PaginatedResponse<T>).results;
    return Array.isArray(results) ? results : [];
  }
  return [];
}

function buildQuery(params?: Record<string, string>): string {
  if (!params) return '';
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  );
  const qs = new URLSearchParams(filtered).toString();
  return qs ? `?${qs}` : '';
}

function buildListEndpoint(basePath: string, params?: Record<string, string>): string {
  const qs = buildQuery(params);
  const path = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return qs ? `${path}${qs}` : path;
}

export interface ProductFacets {
  sizes: string[];
  waist_sizes: string[];
  colors: string[];
  brands: string[];
}

export const productsApi = {
  list: (params?: Record<string, string>) => {
    return api<PaginatedResponse<Product>>(buildListEndpoint('/products', params));
  },
  facets: (category?: string) => {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    return api<ProductFacets>(buildListEndpoint('/products/facets', params));
  },
  detail: (slug: string) => api<ProductDetail>(`/products/${slug}/`),
  featured: () => api<Product[] | PaginatedResponse<Product>>('/products/featured/'),
  newArrivals: () => api<Product[] | PaginatedResponse<Product>>('/products/new-arrivals/'),
  bestSellers: () => api<Product[] | PaginatedResponse<Product>>('/products/best-sellers/'),
  trending: () => api<Product[] | PaginatedResponse<Product>>('/products/trending/'),
};

export const categoriesApi = {
  list: () => api<Category[] | PaginatedResponse<Category>>('/categories/'),
  detail: (slug: string) => api<CategoryDetail>(`/categories/${slug}/`),
};

export const contentApi = {
  heroBanners: () => api<Banner[]>('/content/banners/hero/'),
  promoBanners: () => api<Banner[]>('/content/banners/promo/'),
  testimonials: () => api<Testimonial[]>('/content/testimonials/'),
  settings: () => api<SiteSettings>('/content/settings/'),
  paymentAccounts: (method?: string) => {
    const params: Record<string, string> = {};
    if (method) params.method = method;
    return api<PaymentAccount[]>(buildListEndpoint('/content/payment-accounts', params));
  },
  page: (type: string) => api<PageContent>(`/content/pages/${type}/`),
  newsletter: (email: string) =>
    api('/content/newsletter/', { method: 'POST', body: JSON.stringify({ email }) }),
};

export const cartApi = {
  get: () => api<Cart>('/cart/'),
  add: (variant_id: number, quantity = 1) =>
    api<Cart>('/cart/add/', { method: 'POST', body: JSON.stringify({ variant_id, quantity }) }),
  update: (itemId: number, data: { quantity?: number; saved_for_later?: boolean }) =>
    api<Cart>(`/cart/items/${itemId}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (itemId: number) => api<Cart>(`/cart/items/${itemId}/`, { method: 'DELETE' }),
};

export const authApi = {
  login: (email: string, password: string) =>
    api<{ access: string; refresh: string; user: User }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: RegisterData) =>
    api('/auth/register/', { method: 'POST', body: JSON.stringify(data) }),
  verifyOtp: (email: string, otp: string) =>
    api('/auth/verify-otp/', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  resendOtp: (email: string) =>
    api('/auth/resend-otp/', { method: 'POST', body: JSON.stringify({ email }) }),
  passwordReset: (email: string) =>
    api('/auth/password-reset/', { method: 'POST', body: JSON.stringify({ email }) }),
  passwordResetConfirm: (email: string, otp: string, password: string) =>
    api('/auth/password-reset/confirm/', {
      method: 'POST',
      body: JSON.stringify({ email, otp, password }),
    }),
  profile: () => api<User>('/auth/profile/'),
};

export const ordersApi = {
  checkout: (data: CheckoutData) =>
    api<Order>('/orders/checkout/', { method: 'POST', body: JSON.stringify(data) }),
  shippingRates: (city?: string, subtotal?: number) => {
    const params: Record<string, string> = {};
    if (city) params.city = city;
    if (subtotal != null) params.subtotal = String(subtotal);
    return api<ShippingQuote>(buildListEndpoint('/orders/shipping', params));
  },
  list: () => api<Order[] | PaginatedResponse<Order>>('/orders/'),
  detail: (orderNumber: string) => api<Order>(`/orders/${orderNumber}/`),
  track: (order_number: string, phone: string) =>
    api<Order>('/orders/track/', { method: 'POST', body: JSON.stringify({ order_number, phone }) }),
};

export const couponsApi = {
  validate: (code: string, subtotal: number) =>
    api<{ valid: boolean; discount?: number; error?: string }>('/coupons/validate/', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),
};

export const wishlistApi = {
  list: async () => {
    const data = await api<WishlistItem[] | PaginatedResponse<WishlistItem>>('/products/wishlist/');
    return normalizeList<WishlistItem>(data);
  },
  toggle: (productId: number) =>
    api<{ wishlisted: boolean }>(`/products/wishlist/toggle/${productId}/`, { method: 'POST' }),
};

export interface Product {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  base_price: string;
  compare_price: string | null;
  brand: { id: number; name: string; slug: string } | null;
  category_name: string;
  category_slug: string;
  primary_image: string | { id: number; url: string; alt_text: string } | null;
  in_stock: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_trending: boolean;
  discount_percentage: number;
}

export interface ProductDetail extends Product {
  description: string;
  sku: string;
  stock_quantity: number;
  gender: string;
  material: string;
  specifications: Record<string, string>;
  images: { id: number; image: string; alt_text: string; is_primary: boolean; variant?: number | null }[];
  variants: ProductVariant[];
  related_products: Product[];
  is_wishlisted: boolean;
  meta_title: string;
  meta_description: string;
  category?: { id: number; name: string; slug: string };
  category_slug?: string;
  category_name?: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  color: string;
  color_hex: string;
  size: string;
  waist_size: string;
  length: string;
  sleeve_type: string;
  fabric: string;
  effective_price: string;
  stock_quantity: number;
  in_stock: boolean;
  image?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  icon: string;
  product_count: number;
}

export interface CategoryDetail extends Category {
  subcategories: Category[];
  filter_definitions: FilterDefinition[];
  products?: Product[];
  meta_title: string;
  meta_description: string;
}

export interface FilterDefinition {
  id: number;
  name: string;
  slug: string;
  field_type: string;
  attribute_key: string;
  options: { id: number; label: string; value: string }[];
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string | null;
}

export interface SiteSettings {
  site_name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  whatsapp_number: string;
  facebook_url: string;
  instagram_url: string;
  bank_name: string;
  bank_account: string;
  jazzcash_number: string;
  easypaisa_number: string;
  google_maps_embed: string;
}

export interface PaymentAccount {
  id: number;
  method: 'bank_transfer' | 'jazzcash' | 'easypaisa' | string;
  method_display: string;
  title: string;
  account_title: string;
  account_number: string;
  bank_name: string;
  iban: string;
  instructions: string;
  is_active: boolean;
  display_order: number;
}

export interface PageContent {
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  saved_items: CartItem[];
  subtotal: string;
  total_items: number;
}

export interface CartItem {
  id: number;
  variant: number;
  quantity: number;
  product_name: string;
  product_slug: string;
  unit_price: string;
  line_total: string;
  variant_details: Record<string, string>;
  primary_image: string | null;
  in_stock?: boolean;
  stock_quantity?: number;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_email_verified: boolean;
  is_staff?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface CheckoutData {
  payment_method: string;
  shipping_address: AddressData;
  billing_address?: AddressData;
  coupon_code?: string;
  notes?: string;
}

export interface AddressData {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  status_display: string;
  payment_method: string;
  payment_method_display: string;
  total: string;
  subtotal: string;
  discount: string;
  shipping_cost: string;
  tracking_number: string;
  items: { product_name: string; quantity: number; total_price: string; variant_info: Record<string, string> }[];
  status_history: { status: string; note: string; created_at: string }[];
  created_at: string;
}

export interface ShippingRate {
  id?: number | null;
  city: string;
  city_key: string;
  rate: number;
  is_default?: boolean;
}

export interface ShippingQuote {
  rates: ShippingRate[];
  city?: string;
  shipping_cost?: number;
  subtotal?: number;
  total?: number;
}

export interface WishlistItem {
  id: number;
  product: Product;
}

export function formatPrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return `PKR ${num.toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;
}

export function whatsappLink(number: string, message: string): string {
  const clean = number.replace(/\D/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function getProductImageUrl(product: Product): string {
  const image = product.primary_image;
  if (typeof image === 'string' && image) return image;
  if (image && typeof image === 'object' && 'url' in image && image.url) return image.url;
  return 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=800&fit=crop';
}

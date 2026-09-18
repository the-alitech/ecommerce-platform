import { getApiBaseUrl } from '@/lib/api';

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:2000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

function parseError(err: Record<string, unknown>): string {
  if (typeof err.detail === 'string') return err.detail;
  if (typeof err.error === 'string') return err.error;
  for (const [key, val] of Object.entries(err)) {
    if (Array.isArray(val) && val.length) return `${key}: ${val[0]}`;
    if (typeof val === 'string') return val;
  }
  return 'Request failed';
}

export async function adminApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (options.body && !isFormData) {
    (headers as Record<string, string>)['Content-Type'] =
      (headers as Record<string, string>)['Content-Type'] || 'application/json';
  }
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${getApiBaseUrl()}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(parseError(err as Record<string, unknown>));
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

export async function adminLogin(email: string, password: string) {
  const data = await adminApi<{
    access: string;
    refresh: string;
    user: { is_staff?: boolean };
  }>(
    '/auth/login/',
    { method: 'POST', body: JSON.stringify({ email, password }) }
  );

  let isStaff = Boolean(data.user?.is_staff);
  if (!isStaff && data.access) {
    try {
      const payload = JSON.parse(atob(data.access.split('.')[1] || ''));
      isStaff = Boolean(payload.is_staff);
    } catch {
      isStaff = false;
    }
  }

  if (!isStaff) throw new Error('Admin access required');
  localStorage.setItem('admin_token', data.access);
  return data;
}

export interface SalesPeriod {
  key: string;
  label: string;
  sales: number;
  orders: number;
}

export interface AdminOrder {
  id: number;
  order_number: string;
  status: string;
  status_display: string;
  payment_method: string;
  payment_method_display: string;
  total: string;
  created_at: string;
  items: { product_name: string; quantity: number }[];
}

export interface DashboardStats {
  total_sales: number;
  today_sales: number;
  yesterday_sales: number;
  previous_sales: number;
  this_week_sales: number;
  this_month_sales: number;
  last_month_sales: number;
  last_3_months_sales: number;
  last_6_months_sales: number;
  last_1_year_sales: number;
  total_orders: number;
  today_orders: number;
  this_week_orders: number;
  this_month_orders: number;
  last_month_orders: number;
  last_3_months_orders: number;
  last_6_months_orders: number;
  last_1_year_orders: number;
  previous_orders: number;
  sales_periods: SalesPeriod[];
  total_customers: number;
  total_products: number;
  active_products: number;
  low_stock_variants: number;
  revenue_chart: { date: string; revenue: number; orders: number }[];
  monthly_chart: { month: string; label: string; revenue: number; orders: number }[];
  status_counts: Record<string, number>;
  recent_orders: AdminOrder[];
}

export interface AdminShippingRate {
  id: number;
  city: string;
  slug: string;
  city_key: string;
  charge: string;
  rate: string;
  is_default: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminPaymentAccount {
  id: number;
  method: string;
  method_display: string;
  title: string;
  account_title: string;
  account_number: string;
  bank_name: string;
  iban: string;
  instructions: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminProductListItem {
  id: number;
  name: string;
  slug: string;
  sku: string;
  base_price: string;
  compare_price: string | null;
  category: number;
  category_name: string;
  brand: number | null;
  brand_name: string;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_trending: boolean;
  primary_image: string;
  variant_count: number;
  total_stock: number;
  sales_count: number;
  created_at: string;
}

export interface AdminVariant {
  id?: number | null;
  sku: string;
  color: string;
  color_hex: string;
  size: string;
  waist_size: string;
  length: string;
  sleeve_type: string;
  fabric: string;
  price: string | null;
  stock_quantity: number;
  is_active: boolean;
}

export interface AdminProductImage {
  id: number;
  url: string;
  alt_text: string;
  is_primary: boolean;
  display_order: number;
  variant: number | null;
}

export interface AdminProductDetail {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  short_description: string;
  base_price: string;
  compare_price: string | null;
  stock_quantity: number;
  category: number;
  category_name: string;
  subcategory: number | null;
  brand: number | null;
  brand_name: string;
  gender: string;
  material: string;
  specifications: Record<string, unknown>;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_trending: boolean;
  meta_title: string;
  meta_description: string;
  variants: AdminVariant[];
  images: AdminProductImage[];
  sales_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminProductOptions {
  categories: { id: number; name: string; slug: string; parent: number | null; is_active: boolean }[];
  brands: { id: number; name: string; slug: string; is_active: boolean }[];
  genders: { value: string; label: string }[];
}

export interface PaginatedAdminProducts {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminProductListItem[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2000/api';
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:2000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export async function adminApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Request failed');
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

export async function adminLogin(email: string, password: string) {
  const data = await adminApi<{ access: string; refresh: string; user: { is_staff: boolean } }>(
    '/auth/login/', { method: 'POST', body: JSON.stringify({ email, password }) }
  );
  if (!data.user.is_staff) throw new Error('Admin access required');
  localStorage.setItem('admin_token', data.access);
  return data;
}

export interface SalesPeriod {
  key: string;
  label: string;
  sales: number;
  orders: number;
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
  recent_orders: Order[];
}

export interface Order {
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

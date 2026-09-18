# API Documentation

Base URL: `http://localhost:8000/api`

Interactive Swagger UI: `http://localhost:8000/api/docs/`

OpenAPI Schema: `http://localhost:8000/api/schema/`

## Authentication

JWT Bearer token authentication. Include header:
```
Authorization: Bearer <access_token>
```

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register/` | Register new user | Public |
| POST | `/auth/login/` | Login, returns JWT | Public |
| POST | `/auth/token/refresh/` | Refresh access token | Public |
| POST | `/auth/verify-otp/` | Verify email OTP | Public |
| POST | `/auth/resend-otp/` | Resend verification OTP | Public |
| POST | `/auth/password-reset/` | Request password reset OTP | Public |
| POST | `/auth/password-reset/confirm/` | Reset password with OTP | Public |
| GET/PATCH | `/auth/profile/` | User profile | Required |
| GET/POST | `/auth/addresses/` | User addresses | Required |

## Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories/` | List parent categories |
| GET | `/categories/{slug}/` | Category detail with filters |
| GET | `/categories/{slug}/subcategories/` | Subcategories |

## Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products/` | List products (filterable) |
| GET | `/products/{slug}/` | Product detail |
| GET | `/products/featured/` | Featured products |
| GET | `/products/new-arrivals/` | New arrivals |
| GET | `/products/best-sellers/` | Best sellers |
| GET | `/products/trending/` | Trending products |
| GET | `/products/brands/` | List brands |
| GET/POST | `/products/wishlist/` | Wishlist | Required |
| POST | `/products/wishlist/toggle/{id}/` | Toggle wishlist | Required |

### Product Filters (query params)

- `category`, `subcategory`, `brand` (slugs)
- `min_price`, `max_price`
- `color`, `size`, `material`, `gender`, `fabric`
- `sleeve_type`, `waist_size`, `length`
- `in_stock`, `is_featured`, `is_new_arrival`, `is_bestseller`, `is_trending`
- `search`, `ordering` (-created_at, base_price, -sales_count, name)
- `page` (pagination)

## Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart/` | Get cart |
| POST | `/cart/add/` | Add item `{variant_id, quantity}` |
| PATCH | `/cart/items/{id}/` | Update quantity / save for later |
| DELETE | `/cart/items/{id}/` | Remove item |
| DELETE | `/cart/` | Clear cart |

## Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders/checkout/` | Place order |
| GET | `/orders/` | User order history | Required |
| GET | `/orders/{order_number}/` | Order detail | Required |
| POST | `/orders/track/` | Track order `{order_number, phone}` |

### Checkout Body
```json
{
  "payment_method": "cod",
  "shipping_address": {
    "full_name": "John Doe",
    "phone": "03001234567",
    "address_line1": "123 Street",
    "city": "Lahore",
    "postal_code": "54000",
    "country": "Pakistan"
  },
  "guest_email": "guest@email.com",
  "guest_phone": "03001234567",
  "coupon_code": "WELCOME10"
}
```

## Coupons

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/coupons/validate/` | Validate coupon `{code, subtotal}` |
| GET/POST | `/coupons/` | List/create coupons | Admin |
| GET/PATCH/DELETE | `/coupons/{id}/` | Coupon CRUD | Admin |

## Content

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/content/banners/hero/` | Hero banners |
| GET | `/content/banners/promo/` | Promo banners |
| GET | `/content/testimonials/` | Testimonials |
| GET | `/content/pages/{type}/` | Page content (about, contact) |
| POST | `/content/newsletter/` | Newsletter subscribe |
| GET | `/content/settings/` | Site settings |

## Contact

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/contact/` | Submit contact form |

## Admin Dashboard API

Requires `is_staff` user JWT.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats/` | Dashboard statistics |
| GET | `/dashboard/orders/` | All orders |
| PATCH | `/dashboard/orders/{id}/` | Update order status |
| GET | `/dashboard/orders/export/` | Export orders CSV |
| GET | `/dashboard/customers/` | Customer list with analytics |

## SEO

- Sitemap: `/sitemap.xml`
- Robots: `/robots.txt`

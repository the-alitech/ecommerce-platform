# Ecom Earn Fashion — Project Overview

## 1. Purpose

**Ecom Earn Fashion** is a multi-category e-commerce platform built for fashion and apparel businesses (especially Pakistan-focused stores).

It lets customers:

- Browse products by category (e.g. Shoes)
- Filter by size, color, price, brand, and more
- Add items to cart / wishlist
- Checkout with COD, Bank Transfer, JazzCash, or Easypaisa
- Track orders

It lets store owners (admins):

- View sales (today, week, month, 3/6/12 months, all-time)
- Manage orders and update status
- Configure shipping by city
- Manage payment account numbers
- Manage products, coupons, banners, and content

The goal is a **production-ready fashion store** with a modern customer site and an admin dashboard that can eventually run from **one frontend server**.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────┐
│  Next.js Frontend (port 3000)               │
│  • Storefront (/)                           │
│  • Admin Dashboard (/admin)                 │
│  • API Proxy (/api/* → Django)              │
└──────────────────┬──────────────────────────┘
                   │ HTTP / JSON
┌──────────────────▼──────────────────────────┐
│  Django REST API (port 2000)                │
│  • Auth, Products, Cart, Orders             │
│  • Dashboard stats & admin APIs             │
│  • Django Admin (advanced CRUD)             │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
   PostgreSQL             Media files
   (products, orders)     (images)
```

**Single-server vision:** The store and admin UI live in one Next.js app. The browser calls `/api/...`, and Next.js proxies to Django. Later you can deploy one frontend origin (e.g. `yourdomain.com`) for both shop and `/admin`.

---

## 3. Technologies

### Frontend (Store + Admin UI)

| Technology | Role |
|------------|------|
| **Next.js 15** | App Router, SSR/CSR, routing |
| **React 19** | UI components |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Zustand** | Client auth/cart state |
| **SWR** | Optional data fetching |
| **Recharts** | Admin sales charts |
| **Lucide React** | Icons |

### Backend (API)

| Technology | Role |
|------------|------|
| **Django 5** | Web framework |
| **Django REST Framework** | REST APIs |
| **SimpleJWT** | JWT authentication |
| **django-filter** | Product filtering |
| **drf-spectacular** | OpenAPI / Swagger docs |
| **Pillow** | Image handling |
| **python-decouple** | Environment config |
| **django-cors-headers** | CORS |
| **django-ratelimit** | Rate limiting |
| **Gunicorn** | Production WSGI server |
| **Celery / Redis** | Optional async / cache |
| **django-storages + boto3** | Optional S3 media storage |

### Database & Infrastructure

| Technology | Role |
|------------|------|
| **PostgreSQL** | Primary database |
| **Docker Compose** | Optional full-stack deploy |
| **Nginx** | Typical reverse proxy in production |

---

## 4. Project Structure

```
Ecom-earn/
├── backend/                      # Django REST API
│   ├── apps/
│   │   ├── users/                # Auth, profiles, addresses, OTP
│   │   ├── categories/           # Categories + dynamic filters
│   │   ├── products/             # Products, variants, images, wishlist
│   │   ├── cart/                 # Shopping cart
│   │   ├── orders/               # Checkout, shipping rates, dashboard
│   │   ├── coupons/              # Discount codes
│   │   ├── content/              # Banners, CMS, payment accounts, settings
│   │   └── contact/              # Contact form
│   ├── config/                   # Settings, URLs, WSGI
│   ├── media/                    # Uploaded product images
│   └── manage.py
│
├── frontend/                     # Next.js storefront + admin UI
│   ├── src/app/
│   │   ├── (pages)/              # Shop, cart, checkout, account, etc.
│   │   ├── admin/                # Admin dashboard at /admin
│   │   └── api/[...path]/        # Proxy to Django API
│   ├── src/components/
│   ├── src/lib/                  # api.ts, admin-api.ts, store
│   └── package.json
│
├── admin/                        # Legacy standalone admin (optional; replaced by frontend/admin)
├── docs/                         # API & schema docs (if present)
├── docker-compose.yml
└── README.md
```

---

## 5. Main Features

### Customer Storefront

- Homepage: hero banners, categories, featured / new / bestseller / trending
- Shop by category with filters (size pills, price range, color, etc.)
- Product detail: variants (size/color), images, stock, add to cart
- Cart with stock validation
- Wishlist (login required)
- Checkout (login required) with:
  - City-based shipping rates
  - COD / Bank / JazzCash / Easypaisa
  - Payment account details loaded from database
- Order confirmation + order tracking
- Auth: register, OTP verify, login, password reset

### Admin Dashboard (`/admin`)

- Sales cards: today, yesterday, previous, week, month, 3/6/12 months, all-time
- Revenue charts (30 days / 12 months)
- Orders list + status updates + CSV export
- Customers overview
- Shipping rates CRUD
- Payment accounts CRUD (bank / JazzCash / Easypaisa)
- Links to Django Admin for deep product/content editing

### Backend Capabilities

- JWT auth with `is_staff` for admin access
- Product facets (available sizes/colors/brands)
- Storefront queryset rules (active category/products only)
- Coupons, order notifications hooks, sitemaps

---

## 6. Key Apps Explained

| App | Responsibility |
|-----|----------------|
| `users` | Custom user model, login/register, OTP, addresses |
| `categories` | Categories, filter definitions/options |
| `products` | Products, variants, images, brands, wishlist, seed/shoes |
| `cart` | Cart items, quantity/stock checks |
| `orders` | Checkout, shipping rates, order history, admin stats |
| `coupons` | Percentage / fixed discounts |
| `content` | Banners, pages, testimonials, site settings, payment accounts |
| `contact` | Contact form submissions |

---

## 7. How to Run Locally

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Configure .env (DB credentials, SECRET_KEY, etc.)
python manage.py migrate
python manage.py seed_data
python manage.py seed_shoes --count 100   # optional shoe catalog
python manage.py runserver 0.0.0.0:2000
```

### Frontend (store + admin)

```bash
cd frontend
npm install
npm run dev
```

### URLs

| Service | URL |
|---------|-----|
| Storefront | http://localhost:3000 |
| Admin Dashboard | http://localhost:3000/admin |
| Django Admin (advanced) | http://127.0.0.1:2000/admin/ |
| API | http://127.0.0.1:2000/api/ |
| Swagger docs | http://127.0.0.1:2000/api/docs/ |

### Demo Credentials (after `seed_data`)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@ecom-earn.com` | `admin123` |
| Customer | `customer@demo.com` | `demo123` |

Create another admin:

```bash
python manage.py createsuperuser
```

(Must have **Staff** status to use `/admin`.)

---

## 8. Environment Variables (typical)

### Backend (`backend/.env`)

- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`
- `CORS_ALLOWED_ORIGINS`
- Email SMTP settings (optional)
- `USE_S3` / AWS keys (optional)

### Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_API_URL=http://127.0.0.1:2000/api`
- `NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:2000`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `NEXT_PUBLIC_WHATSAPP_NUMBER=...`

In the browser, the app prefers same-origin `/api` (proxy) to avoid CORS issues.

---

## 9. Important Product Flows

### Checkout

1. User must be logged in  
2. Selects city → shipping cost from `ShippingRate` table  
3. Chooses payment method  
4. If bank/JazzCash/Easypaisa → shows accounts from `PaymentAccount` table  
5. Order is created; cart cleared  

### Admin sales

Dashboard aggregates non-cancelled orders for:

- Today / Yesterday / Previous (before today)  
- This week / This month / Last month  
- Last 3 months / 6 months / 1 year / All time  

### Size filtering

Shop size pills call `GET /api/products/?size=41` (or other size). Options come from category filters + live variant facets.

---

## 10. Security Notes

- JWT access tokens for API auth  
- Admin routes require `is_staff=True`  
- Rate limiting on sensitive auth endpoints  
- CORS configured for local/frontend origins  
- Serializers validate inputs  
- Guest checkout disabled (login required to place orders)  

---

## 11. Future / Recommended Improvements

- Full product CRUD inside Next.js `/admin` (reduce need for Django Admin)
- Image CDN / S3 in production
- Automated tests (API + critical checkout flows)
- Email/SMS order notifications wired for production SMTP
- Nginx + SSL single-domain deploy (`/` store, `/admin` dashboard, `/api` backend)

---

## 12. License

Proprietary — Ecom Earn Fashion Platform.

---

## Quick Summary

**Ecom Earn** is a Django + Next.js fashion e-commerce system: customers shop on the storefront; owners manage sales, orders, shipping, and payments from `/admin` on the same frontend app, backed by a PostgreSQL-powered REST API.

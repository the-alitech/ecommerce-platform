## Screenshots

### Homepage

<img width="1380" height="636" alt="Homepage" src="https://github.com/user-attachments/assets/97c3992e-f72c-4b86-8248-149e809cae9d" />

### Category

<img width="1380" height="636" alt="Category" src="https://github.com/user-attachments/assets/40e81f42-99c3-420e-9485-db7aeae1a772" />

### Activity

<img width="1380" height="636" alt="Activity" src="https://github.com/user-attachments/assets/9bbdffe6-036d-4b1e-8c14-49c7e11473b5" />

### Upcoming

<img width="1380" height="636" alt="Upcoming" src="https://github.com/user-attachments/assets/b993b637-bcf8-48ff-81e4-34a90eeb5bba" />

### Featured

<img width="1380" height="636" alt="Featured" src="https://github.com/user-attachments/assets/234ae16c-83c7-4847-be7e-7c15cf2fe6a3" />

### Best Seller

<img width="1380" height="636" alt="Best Seller" src="https://github.com/user-attachments/assets/06958806-4644-4c5d-9e1a-9ac7430ec044" />

### Trending

<img width="1380" height="636" alt="Trending" src="https://github.com/user-attachments/assets/79ede26b-2510-43bb-ba19-2ec7e2fbc204" />

### Customer Reviews

<img width="1380" height="636" alt="Customer Reviews" src="https://github.com/user-attachments/assets/6cee8c6b-92b9-44bf-9cc3-2c7ff094308c" />

### Footer

<img width="1380" height="636" alt="Footer" src="https://github.com/user-attachments/assets/88d0cad2-1ebc-45d5-971d-040ad779c2a0" />

### Shop

<img width="1380" height="636" alt="Shop" src="https://github.com/user-attachments/assets/3c9bc226-ad7f-4a66-959e-e2840bcb88ad" />

### Product Detail

<img width="1380" height="636" alt="Product Detail" src="https://github.com/user-attachments/assets/31530a48-f394-4783-967a-30c011705fbc" />

### Shopping Cart

<img width="1380" height="636" alt="Shopping Cart" src="https://github.com/user-attachments/assets/079aa84e-3e02-4f45-b3cd-a66ffbe5b3ec" />

### Sign In

<img width="1380" height="636" alt="Sign In" src="https://github.com/user-attachments/assets/349f75c3-ef84-44d1-a258-2f18756a6dca" />

### Create Account

<img width="1380" height="636" alt="Create Account" src="https://github.com/user-attachments/assets/42b94731-5fff-4637-b6c1-286ef768bf15" />

### Account Registration

<img width="1380" height="636" alt="Account Registration" src="https://github.com/user-attachments/assets/a3b2ef9c-94f1-4221-8a55-cc474281d532" />




<img width="1380" height="822" alt="Screenshot from 2026-09-18 16-42-39" src="https://github.com/user-attachments/assets/2a04f0e7-87bd-4f38-ac60-e2d3a53a58d0" />

# Ecom Earn Fashion

Production-ready multi-category e-commerce platform for fashion and apparel businesses.

> **Full documentation:** see [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) for purpose, architecture, technologies, features, and how to run.

## Tech Stack

- **Frontend + Admin UI**: Next.js 15, TypeScript, Tailwind CSS, Recharts (admin at `/admin`)
- **Backend**: Django 5 + Django REST Framework
- **Database**: PostgreSQL
- **Auth**: JWT (SimpleJWT)
- **Storage**: Local media or AWS S3 (django-storages)
- **Cache**: Redis (optional)
- **Deployment**: Docker Compose

## Quick Access

| Service | URL |
|---------|-----|
| Storefront | http://localhost:3000 |
| Admin Dashboard | http://localhost:3000/admin |
| Django Admin | http://127.0.0.1:2000/admin/ |
| API | http://127.0.0.1:2000/api/ |

### Demo Credentials (after `seed_data`)

- **Admin**: `admin@ecom-earn.com` / `admin123`
- **Customer**: `customer@demo.com` / `demo123`

## Local Quick Start

```bash
# Backend
cd backend && source .venv/bin/activate
python manage.py migrate && python manage.py seed_data
python manage.py runserver 0.0.0.0:2000

# Frontend (store + admin)
cd frontend && npm install && npm run dev
```

For Docker, API docs, schema, and production notes, see [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) and [README sections below / docs/](./docs/).

## Project Structure

```
Ecom-earn/
├── backend/                 # Django REST API
│   ├── apps/
│   │   ├── users/           # Auth, profiles, addresses
│   │   ├── categories/      # Dynamic categories & filters
│   │   ├── products/        # Products, variants, wishlist
│   │   ├── cart/            # Shopping cart
│   │   ├── orders/          # Orders, tracking, notifications
│   │   ├── coupons/         # Discount coupons
│   │   ├── content/         # Banners, testimonials, CMS
│   │   └── contact/         # Contact form
│   └── config/              # Django settings
├── frontend/                # Customer-facing Next.js store
├── admin/                   # Admin dashboard Next.js app
├── docs/
│   ├── API.md               # API documentation
│   └── DATABASE_SCHEMA.md   # Database schema
├── docker-compose.yml
└── .env.example
```

## Quick Start (Docker)

```bash
# 1. Clone and configure
cp .env.example .env

# 2. Start all services
docker compose up -d --build

# 3. Run migrations and seed demo data
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_data

# 4. Create superuser (optional, seed creates admin)
docker compose exec backend python manage.py createsuperuser
```

### Access URLs

| Service | URL |
|---------|-----|
| Storefront | http://localhost:3000 |
| Admin Dashboard | http://localhost:3001 |
| Django Admin | http://localhost:8000/admin/ |
| API Docs (Swagger) | http://localhost:8000/api/docs/ |

### Demo Credentials (after seed)

- **Admin**: `admin@ecom-earn.com` / `admin123`
- **Customer**: `customer@demo.com` / `demo123`

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start PostgreSQL and Redis locally, then:
export POSTGRES_HOST=localhost
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Admin Dashboard

```bash
cd admin
npm install
npm run dev
```

## Features

### Public Website
- Premium fashion homepage with hero slider, featured/new/bestseller/trending sections
- Product catalog with grid/list view, search, sort, pagination
- Dynamic category filters (configurable from admin)
- Product detail with image zoom, variants, WhatsApp inquiry
- Guest & user checkout with COD, Bank Transfer, JazzCash, Easypaisa
- Order tracking by order number + phone
- JWT auth with OTP email verification

### Admin Panel
- Dashboard with sales, orders, customers, revenue charts
- Order management with status updates and CSV export
- Product/variant/inventory management (Django Admin)
- Dynamic category & filter configuration
- Coupon management
- Content management (banners, testimonials, pages)

### Security
- JWT authentication with token rotation
- Rate limiting on auth and contact endpoints
- CORS, CSRF, XSS protection
- Input validation via DRF serializers

## Production Deployment

### 1. Environment Variables

Copy `.env.example` to `.env` and set production values:

```bash
DEBUG=False
SECRET_KEY=<generate-secure-key>
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
USE_S3=True
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_STORAGE_BUCKET_NAME=...
```

### 2. Deploy with Docker

```bash
docker compose -f docker-compose.yml up -d --build
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py collectstatic --noinput
docker compose exec backend python manage.py seed_data
```

### 3. Reverse Proxy (Nginx example)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
    }
    location /api/ {
        proxy_pass http://localhost:8000;
    }
    location /admin/ {
        proxy_pass http://localhost:8000;
    }
    location /media/ {
        proxy_pass http://localhost:8000;
    }
}
```

### 4. SSL

Use Certbot or your cloud provider's SSL termination.

### 5. Email Configuration

Set SMTP credentials in `.env` for order notifications:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your@gmail.com
EMAIL_HOST_PASSWORD=app-password
ADMIN_ORDER_EMAIL=admin@yourdomain.com
```

## API Documentation

See [docs/API.md](docs/API.md) for full endpoint reference.
Interactive docs at `/api/docs/` when backend is running.

## Database Schema

See [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for complete schema documentation.

## Seed Data

The `seed_data` management command creates:
- 4 categories (Shoes, Shirts, Trousers, Bags) with dynamic filters
- 9 demo products with variants
- 2 coupons (WELCOME10, FLAT500)
- Testimonials and page content
- Admin and demo customer accounts

```bash
python manage.py seed_data
```



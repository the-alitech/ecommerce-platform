# Database Schema

## Entity Relationship Overview

```
User ──┬── Address
       ├── Cart ── CartItem ── ProductVariant ── Product
       ├── Wishlist ── Product
       └── Order ── OrderItem ── ProductVariant

Category ──┬── Subcategory (self-ref)
           ├── FilterDefinition ── FilterOption
           └── Product

Brand ── Product
Product ──┬── ProductVariant
          └── ProductImage

Order ── OrderStatusHistory
Coupon (standalone)
Banner, Testimonial, PageContent, SiteSettings, ContactMessage, NewsletterSubscriber
```

## Tables

### users_user
| Column | Type | Notes |
|--------|------|-------|
| id | BigInt PK | |
| email | Email unique | Login field |
| username | VARCHAR | |
| password | VARCHAR | Hashed |
| first_name, last_name | VARCHAR | |
| phone | VARCHAR | |
| is_email_verified | Boolean | OTP verified |
| otp_code, otp_created_at | | Email verification |
| avatar | ImageField | |
| is_staff, is_superuser | Boolean | Admin access |

### users_address
| Column | Type | Notes |
|--------|------|-------|
| user_id | FK → users_user | |
| address_type | shipping/billing | |
| full_name, phone | VARCHAR | |
| address_line1, address_line2 | VARCHAR | |
| city, state, postal_code, country | VARCHAR | |
| is_default | Boolean | |

### categories_category
| Column | Type | Notes |
|--------|------|-------|
| name, slug | VARCHAR | SEO URL |
| parent_id | FK self | Subcategories |
| image, icon | | Display |
| is_active, display_order | | |
| meta_title, meta_description | SEO | |

### categories_filterdefinition
| Column | Type | Notes |
|--------|------|-------|
| category_id | FK | Per-category filters |
| name, slug | VARCHAR | |
| field_type | choice/multi_choice/range/boolean/text | |
| attribute_key | VARCHAR | Maps to product/variant field |

### categories_filteroption
| Column | Type | Notes |
|--------|------|-------|
| filter_definition_id | FK | |
| label, value | VARCHAR | |

### products_brand
| name, slug, logo, is_active | | |

### products_product
| Column | Type | Notes |
|--------|------|-------|
| category_id, subcategory_id | FK | |
| brand_id | FK | |
| name, slug, sku | VARCHAR | |
| description, short_description | Text | |
| base_price, compare_price | Decimal | |
| stock_quantity | Int | Base stock |
| gender, material | VARCHAR | |
| specifications | JSON | |
| is_featured, is_new_arrival, is_bestseller, is_trending | Boolean | |
| meta_title, meta_description | SEO | |
| views_count, sales_count | Int | Analytics |

### products_productvariant
| Column | Type | Notes |
|--------|------|-------|
| product_id | FK | |
| sku | VARCHAR unique | |
| color, color_hex, size | VARCHAR | |
| waist_size, length, sleeve_type, fabric | Category-specific | |
| price | Decimal nullable | Override base price |
| stock_quantity | Int | |
| attributes | JSON | Dynamic filters |

### products_productimage
| product_id, variant_id | FK | |
| image, alt_text, is_primary, display_order | | |

### products_wishlist
| user_id, product_id | FK unique together | |

### cart_cart / cart_cartitem
| Cart: user_id or session_key | |
| CartItem: cart_id, variant_id, quantity, saved_for_later | |

### orders_order
| Column | Type | Notes |
|--------|------|-------|
| order_number | VARCHAR unique | Auto-generated EE######## |
| user_id | FK nullable | Guest orders |
| status | pending→delivered/cancelled/returned | |
| payment_method | cod/bank_transfer/jazzcash/easypaisa | |
| payment_status | pending/paid/failed/refunded | |
| subtotal, discount, shipping_cost, total | Decimal | |
| shipping_address, billing_address | JSON | |
| guest_email, guest_phone | | Guest checkout |
| tracking_number | VARCHAR | |

### orders_orderitem
| order_id, variant_id | FK | |
| product_name, variant_info JSON | Snapshot | |
| quantity, unit_price, total_price | | |

### coupons_coupon
| code, discount_type, value, min_order_amount | |
| max_uses, used_count, expires_at, is_active | | |

### content_banner, content_testimonial, content_pagecontent
### content_newslettersubscriber, content_sitesettings
### contact_contactmessage

## Indexes
- `products_product`: slug, (is_active, is_featured), (category, is_active)
- `orders_order`: order_number, status, guest_phone

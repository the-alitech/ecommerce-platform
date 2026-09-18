from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from apps.categories.models import Category, FilterDefinition, FilterOption
from apps.products.models import Brand, Product, ProductVariant, ProductImage
from apps.content.models import Banner, Testimonial, PageContent, SiteSettings
from apps.coupons.models import Coupon

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed demo fashion store data'

    def add_arguments(self, parser):
        parser.add_argument('--fresh', action='store_true', help='Delete existing products before seeding')

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        if options['fresh']:
            ProductImage.objects.all().delete()
            ProductVariant.objects.all().delete()
            Product.objects.all().delete()
            self.stdout.write('Cleared existing products.')

        admin, _ = User.objects.update_or_create(
            email='admin@ecom-earn.com',
            defaults={
                'username': 'admin_ecom',
                'is_staff': True,
                'is_superuser': True,
                'is_email_verified': True,
                'first_name': 'Admin',
                'last_name': 'User',
            }
        )
        admin.set_password('admin123')
        admin.save()

        demo_user, _ = User.objects.update_or_create(
            email='customer@demo.com',
            defaults={
                'username': 'demo_customer',
                'first_name': 'Demo',
                'last_name': 'Customer',
                'phone': '03001234567',
                'is_email_verified': True,
            }
        )
        demo_user.set_password('demo123')
        demo_user.save()

        SiteSettings.objects.update_or_create(pk=1, defaults={
            'site_name': 'H.B Shoes',
            'tagline': 'Premium Fashion for Every Style',
            'phone': '+92 300 1234567',
            'email': 'info@ecom-earn.com',
            'address': '123 Fashion Street, Gulberg III, Lahore, Pakistan',
            'whatsapp_number': '923001234567',
            'facebook_url': 'https://facebook.com/ecomearn',
            'instagram_url': 'https://instagram.com/ecomearn',
            'bank_name': 'HBL Bank',
            'bank_account': '12345678901234',
            'bank_iban': 'PK36HABB0001234567890123',
            'jazzcash_number': '03001234567',
            'easypaisa_number': '03001234567',
        })

        categories_data = [
            {'name': 'Shoes', 'slug': 'shoes', 'icon': '👟', 'order': 1,
             'filters': [
                 {'name': 'Brand', 'key': 'brand', 'type': 'choice', 'options': ['Nike', 'Adidas', 'Puma', 'Bata']},
                 {'name': 'Color', 'key': 'color', 'type': 'choice', 'options': ['Black', 'White', 'Brown', 'Blue', 'Red']},
                 {'name': 'Size', 'key': 'size', 'type': 'choice', 'options': ['6', '7', '8', '9', '10', '11', '12']},
                 {'name': 'Material', 'key': 'material', 'type': 'choice', 'options': ['Leather', 'Canvas', 'Synthetic', 'Suede']},
                 {'name': 'Gender', 'key': 'gender', 'type': 'choice', 'options': ['Men', 'Women', 'Unisex']},
             ]},
            {'name': 'Shirts', 'slug': 'shirts', 'icon': '👔', 'order': 2,
             'filters': [
                 {'name': 'Color', 'key': 'color', 'type': 'choice', 'options': ['White', 'Black', 'Blue', 'Grey', 'Pink']},
                 {'name': 'Size', 'key': 'size', 'type': 'choice', 'options': ['S', 'M', 'L', 'XL', 'XXL']},
                 {'name': 'Sleeve Type', 'key': 'sleeve_type', 'type': 'choice', 'options': ['Full Sleeve', 'Half Sleeve', 'Sleeveless']},
                 {'name': 'Fabric', 'key': 'fabric', 'type': 'choice', 'options': ['Cotton', 'Linen', 'Polyester', 'Silk']},
                 {'name': 'Brand', 'key': 'brand', 'type': 'choice', 'options': ['Outfitters', 'Breakout', 'Engine']},
             ]},
            {'name': 'Trousers', 'slug': 'trousers', 'icon': '👖', 'order': 3,
             'filters': [
                 {'name': 'Waist Size', 'key': 'waist_size', 'type': 'choice', 'options': ['28', '30', '32', '34', '36', '38']},
                 {'name': 'Length', 'key': 'length', 'type': 'choice', 'options': ['30', '32', '34', '36']},
                 {'name': 'Color', 'key': 'color', 'type': 'choice', 'options': ['Black', 'Navy', 'Grey', 'Khaki', 'Blue']},
                 {'name': 'Fabric', 'key': 'fabric', 'type': 'choice', 'options': ['Cotton', 'Denim', 'Chino', 'Wool']},
             ]},
            {'name': 'Bags', 'slug': 'bags', 'icon': '👜', 'order': 4,
             'filters': [
                 {'name': 'Color', 'key': 'color', 'type': 'choice', 'options': ['Black', 'Brown', 'Tan', 'Red', 'Blue']},
                 {'name': 'Brand', 'key': 'brand', 'type': 'choice', 'options': ['Gucci', 'Louis Vuitton', 'Coach', 'Local']},
                 {'name': 'Material', 'key': 'material', 'type': 'choice', 'options': ['Leather', 'Canvas', 'Nylon', 'PU Leather']},
             ]},
        ]

        category_map = {}
        for cat_data in categories_data:
            cat, _ = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={
                    'name': cat_data['name'],
                    'description': f'Premium {cat_data["name"].lower()} collection',
                    'icon': cat_data['icon'],
                    'display_order': cat_data['order'],
                    'meta_title': f'Shop {cat_data["name"]} - Ecom Earn Fashion',
                    'meta_description': f'Browse our premium {cat_data["name"].lower()} collection',
                }
            )
            category_map[cat_data['slug']] = cat
            for i, f in enumerate(cat_data.get('filters', [])):
                fd, _ = FilterDefinition.objects.get_or_create(
                    category=cat, slug=f['key'],
                    defaults={
                        'name': f['name'], 'field_type': f['type'],
                        'attribute_key': f['key'], 'display_order': i,
                    }
                )
                for j, opt in enumerate(f.get('options', [])):
                    FilterOption.objects.get_or_create(
                        filter_definition=fd, value=opt.lower().replace(' ', '_'),
                        defaults={'label': opt, 'display_order': j}
                    )

        brands = {}
        for name in ['Nike', 'Adidas', 'Puma', 'Outfitters', 'Breakout', 'Engine', 'Gucci', 'Coach']:
            b, _ = Brand.objects.get_or_create(name=name)
            brands[name] = b

        products_data = [
            {'name': 'Nike Air Max 270', 'category': 'shoes', 'brand': 'Nike', 'price': 15999, 'compare': 18999,
             'sku': 'SH-NK-270', 'gender': 'men', 'material': 'Synthetic', 'featured': True, 'bestseller': True,
             'variants': [{'color': 'Black', 'size': '9', 'stock': 15}, {'color': 'White', 'size': '10', 'stock': 12}]},
            {'name': 'Adidas Ultraboost 22', 'category': 'shoes', 'brand': 'Adidas', 'price': 18999, 'compare': 22000,
             'sku': 'SH-AD-UB22', 'gender': 'unisex', 'material': 'Synthetic', 'trending': True,
             'variants': [{'color': 'Blue', 'size': '8', 'stock': 8}, {'color': 'Black', 'size': '9', 'stock': 10}]},
            {'name': 'Classic Leather Oxford', 'category': 'shoes', 'brand': 'Puma', 'price': 12999, 'compare': 15000,
             'sku': 'SH-PU-OX', 'gender': 'men', 'material': 'Leather', 'new_arrival': True,
             'variants': [{'color': 'Brown', 'size': '9', 'stock': 6}, {'color': 'Black', 'size': '10', 'stock': 5}]},
            {'name': 'Premium Cotton Formal Shirt', 'category': 'shirts', 'brand': 'Outfitters', 'price': 3999, 'compare': 4999,
             'sku': 'SR-OF-FRM', 'material': 'Cotton', 'featured': True,
             'variants': [{'color': 'White', 'size': 'M', 'sleeve': 'Full Sleeve', 'fabric': 'Cotton', 'stock': 25},
                          {'color': 'Blue', 'size': 'L', 'sleeve': 'Full Sleeve', 'fabric': 'Cotton', 'stock': 20}]},
            {'name': 'Casual Linen Shirt', 'category': 'shirts', 'brand': 'Breakout', 'price': 3499, 'compare': 4299,
             'sku': 'SR-BR-LIN', 'material': 'Linen', 'trending': True,
             'variants': [{'color': 'Beige', 'size': 'L', 'sleeve': 'Half Sleeve', 'fabric': 'Linen', 'stock': 18}]},
            {'name': 'Slim Fit Chino Trousers', 'category': 'trousers', 'brand': 'Engine', 'price': 4999, 'compare': 5999,
             'sku': 'TR-EN-CHN', 'material': 'Chino', 'bestseller': True,
             'variants': [{'color': 'Khaki', 'waist': '32', 'length': '32', 'fabric': 'Chino', 'stock': 15},
                          {'color': 'Navy', 'waist': '34', 'length': '32', 'fabric': 'Chino', 'stock': 12}]},
            {'name': 'Classic Denim Jeans', 'category': 'trousers', 'brand': 'Outfitters', 'price': 4499, 'compare': 5499,
             'sku': 'TR-OF-DNM', 'material': 'Denim', 'new_arrival': True,
             'variants': [{'color': 'Blue', 'waist': '30', 'length': '32', 'fabric': 'Denim', 'stock': 20}]},
            {'name': 'Leather Tote Bag', 'category': 'bags', 'brand': 'Coach', 'price': 24999, 'compare': 29999,
             'sku': 'BG-CO-TOT', 'material': 'Leather', 'featured': True,
             'variants': [{'color': 'Brown', 'stock': 8}, {'color': 'Black', 'stock': 6}]},
            {'name': 'Canvas Crossbody Bag', 'category': 'bags', 'brand': 'Gucci', 'price': 18999, 'compare': 22000,
             'sku': 'BG-GC-CRS', 'material': 'Canvas', 'trending': True,
             'variants': [{'color': 'Tan', 'stock': 10}]},
        ]

        for pd in products_data:
            cat = category_map[pd['category']]
            product, created = Product.objects.get_or_create(
                sku=pd['sku'],
                defaults={
                    'name': pd['name'],
                    'category': cat,
                    'brand': brands.get(pd.get('brand')),
                    'description': f'Premium quality {pd["name"]}. Crafted with attention to detail for the modern fashion enthusiast.',
                    'short_description': f'Stylish {pd["name"]} for everyday wear.',
                    'base_price': Decimal(str(pd['price'])),
                    'compare_price': Decimal(str(pd.get('compare', 0))),
                    'gender': pd.get('gender', ''),
                    'material': pd.get('material', ''),
                    'specifications': {'care': 'Machine wash cold', 'origin': 'Pakistan'},
                    'is_featured': pd.get('featured', False),
                    'is_new_arrival': pd.get('new_arrival', False),
                    'is_bestseller': pd.get('bestseller', False),
                    'is_trending': pd.get('trending', False),
                    'meta_title': f'{pd["name"]} - Ecom Earn Fashion',
                }
            )
            if created:
                for i, v in enumerate(pd.get('variants', [])):
                    ProductVariant.objects.create(
                        product=product,
                        sku=f"{pd['sku']}-{i+1}",
                        color=v.get('color', ''),
                        size=v.get('size', ''),
                        waist_size=v.get('waist', ''),
                        length=v.get('length', ''),
                        sleeve_type=v.get('sleeve', ''),
                        fabric=v.get('fabric', ''),
                        stock_quantity=v.get('stock', 10),
                    )

        PageContent.objects.update_or_create(page_type='about', defaults={
            'title': 'About Ecom Earn Fashion',
            'content': '<p>Welcome to Ecom Earn Fashion, your premier destination for premium fashion and apparel. We curate the finest collection of shoes, shirts, trousers, and bags from top brands.</p><p>Our mission is to make premium fashion accessible to everyone in Pakistan with exceptional customer service and fast delivery.</p>',
            'meta_title': 'About Us - Ecom Earn Fashion',
        })
        PageContent.objects.update_or_create(page_type='contact', defaults={
            'title': 'Contact Us',
            'content': '<p>We would love to hear from you. Reach out via phone, email, or visit our store in Lahore.</p>',
        })
        PageContent.objects.update_or_create(page_type='payment_instructions', defaults={
            'title': 'Payment Instructions',
            'content': '<h3>Bank Transfer</h3><p>Transfer to HBL Account: 12345678901234</p><h3>JazzCash</h3><p>Send to: 03001234567</p><h3>Easypaisa</h3><p>Send to: 03001234567</p>',
        })

        hero_banners = [
            {
                'title': 'New Season Collection',
                'subtitle': 'Discover premium fashion crafted for every occasion',
                'link': '/shop',
                'image_url': 'https://images.unsplash.com/photo-1483985988354-763728e1935b?w=1920&h=1080&fit=crop&q=85',
                'display_order': 0,
            },
            {
                'title': 'Step Into Style',
                'subtitle': 'Premium footwear — up to 30% off selected shoes',
                'link': '/shop/shoes',
                'image_url': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&h=1080&fit=crop&q=85',
                'display_order': 1,
            },
            {
                'title': 'Elevate Your Wardrobe',
                'subtitle': 'Curated shirts, trousers & accessories for the modern you',
                'link': '/shop/shirts',
                'image_url': 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1920&h=1080&fit=crop&q=85',
                'display_order': 2,
            },
            {
                'title': 'Luxury Bags & More',
                'subtitle': 'Statement pieces that complete every outfit',
                'link': '/shop/bags',
                'image_url': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop&q=85',
                'display_order': 3,
            },
        ]
        for b in hero_banners:
            Banner.objects.update_or_create(
                title=b['title'],
                banner_type='hero',
                defaults={
                    'subtitle': b['subtitle'],
                    'link': b['link'],
                    'image_url': b['image_url'],
                    'display_order': b['display_order'],
                    'is_active': True,
                },
            )

        promo_banners = [
            {
                'title': 'Summer Sale',
                'subtitle': 'Fresh styles for the season',
                'link': '/shop?is_new_arrival=true',
                'image_url': 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=600&fit=crop&q=85',
                'display_order': 0,
            },
            {
                'title': 'Best Sellers',
                'subtitle': 'Most loved by our customers',
                'link': '/shop?is_bestseller=true',
                'image_url': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=600&fit=crop&q=85',
                'display_order': 1,
            },
        ]
        for b in promo_banners:
            Banner.objects.update_or_create(
                title=b['title'],
                banner_type='promo',
                defaults={
                    'subtitle': b['subtitle'],
                    'link': b['link'],
                    'image_url': b['image_url'],
                    'display_order': b['display_order'],
                    'is_active': True,
                },
            )
        self.stdout.write(f'  → {len(hero_banners)} hero + {len(promo_banners)} promo banners')

        for i, t in enumerate([
            {'name': 'Ayesha Khan', 'role': 'Fashion Blogger', 'content': 'Amazing quality and fast delivery! My go-to fashion store.', 'rating': 5},
            {'name': 'Ahmed Ali', 'role': 'Regular Customer', 'content': 'Best shoes collection in Pakistan. Highly recommended!', 'rating': 5},
            {'name': 'Sara Malik', 'role': 'Style Enthusiast', 'content': 'Love the premium shirts. Great prices and excellent service.', 'rating': 4},
        ]):
            Testimonial.objects.get_or_create(name=t['name'], defaults={**t, 'display_order': i})

        Coupon.objects.get_or_create(code='WELCOME10', defaults={
            'description': '10% off your first order',
            'discount_type': 'percentage', 'value': 10,
            'min_order_amount': 2000,
            'expires_at': timezone.now() + timedelta(days=365),
        })
        Coupon.objects.get_or_create(code='FLAT500', defaults={
            'description': 'PKR 500 off orders above 5000',
            'discount_type': 'fixed', 'value': 500,
            'min_order_amount': 5000,
            'expires_at': timezone.now() + timedelta(days=180),
        })

        self.stdout.write(self.style.SUCCESS('Seed data created successfully!'))
        self.stdout.write('Admin: admin@ecom-earn.com / admin123')
        self.stdout.write('Demo Customer: customer@demo.com / demo123')

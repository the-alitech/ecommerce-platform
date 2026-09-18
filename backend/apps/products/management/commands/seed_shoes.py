import random
import urllib.error
import urllib.request
from decimal import Decimal
from io import BytesIO

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from PIL import Image, ImageDraw

from apps.categories.models import Category, FilterDefinition, FilterOption
from apps.products.color_utils import resolve_color_hex
from apps.products.models import Brand, Product, ProductImage, ProductVariant

SHOE_SIZES = ['39', '40', '41', '42', '43', '44', '45']
SHOE_COLORS = ['Black', 'White', 'Brown', 'Blue', 'Red', 'Grey', 'Navy', 'Green']
SHOE_MATERIALS = ['Leather', 'Canvas', 'Synthetic', 'Suede']
SHOE_GENDERS = ['men', 'women', 'unisex']

SHOE_BRANDS = {
    'Nike': [
        'Air Max 270', 'Air Max 90', 'Air Force 1', 'Revolution 6', 'Pegasus 40',
        'Court Vision', 'Downshifter 12', 'Flex Runner', 'Zoom Fly 5', 'Blazer Mid',
    ],
    'Adidas': [
        'Ultraboost 22', 'Stan Smith', 'Superstar', 'NMD R1', 'Gazelle',
        'Forum Low', 'Solarboost 4', 'Grand Court', 'Runfalcon 3', 'Samba OG',
    ],
    'Puma': [
        'RS-X', 'Suede Classic', 'Mayze', 'Velocity Nitro', 'Cali Sport',
        'Smash V2', 'Future Rider', 'Mirage Sport', 'Anzarun', 'Flyer Runner',
    ],
    'Reebok': [
        'Classic Leather', 'Club C 85', 'Nano X3', 'Zig Dynamica', 'Floatride Energy',
        'Royal Glide', 'Walk Ultra', 'Astroride', 'Flexagon Force', 'Lite 3',
    ],
    'New Balance': [
        '574 Core', '990v5', '327', 'Fresh Foam 1080', '550',
        'FuelCell Rebel', '530', '2002R', '480', 'XC-72',
    ],
    'Converse': [
        'Chuck Taylor All Star', 'Chuck 70', 'Run Star Hike', 'One Star', 'Pro Leather',
        'Chuck Taylor Lift', 'All Star Lift', 'Weapon CX', 'Star Player', 'Fastbreak Pro',
    ],
    'Skechers': [
        'D\'Lites', 'Go Walk 6', 'Arch Fit', 'Max Cushioning', 'Stamina',
        'Equalizer', 'Track Sinton', 'Bobs Squad', 'Summits', 'Flex Advantage',
    ],
    'Asics': [
        'Gel-Kayano 30', 'Gel-Nimbus 25', 'Gel-Contend 8', 'GT-2000 12', 'Gel-Venture 9',
        'Gel-Excite 10', 'Gel-Pulse 14', 'Jolt 4', 'Patriot 13', 'Gel-Quantum 360',
    ],
    'Fila': [
        'Disruptor II', 'Ray Tracer', 'Mindblower', 'Axilus 2', 'Original Fitness',
        'Renno', 'Spaghetti', 'Grant Hill 2', 'T-1 Mid', 'Euro Jogger',
    ],
    'Bata': [
        'Comfit Formal', 'Power Flex', 'North Star Runner', 'Red Label Oxford',
        'Bubblegummers Sport', 'Hush Puppies Casual', 'Weinbrenner Trek', 'North Star Canvas',
        'Power Active', 'Comfit Slip-On',
    ],
}

# Verified Unsplash shoe photo IDs (HTTP 200)
SHOE_PHOTO_IDS = [
    '1542291026-7eec264c27ff',
    '1606107557195-0e29a4b5b4aa',
    '1595950653106-6c9ebd614d3a',
    '1552346154-21d32810aba3',
    '1560769629-975ec94e6a86',
    '1608231387042-66d1773070a5',
    '1539185441755-769473a23570',
]

ACCENT_PALETTES = [
    ('#1e3a5f', '#3b82f6'),
    ('#1f2937', '#6b7280'),
    ('#7f1d1d', '#ef4444'),
    ('#14532d', '#22c55e'),
    ('#4c1d95', '#a855f7'),
    ('#78350f', '#f59e0b'),
    ('#0f766e', '#14b8a6'),
    ('#9a3412', '#fb923c'),
]


def _hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i + 2], 16) for i in (0, 2, 4))


def _blend(c1, c2, ratio=0.5):
    return tuple(int(c1[i] * (1 - ratio) + c2[i] * ratio) for i in range(3))


def _luminance(rgb):
    return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]


def shoe_photo_url(seed=0, style=0):
    photo_id = SHOE_PHOTO_IDS[(seed + style) % len(SHOE_PHOTO_IDS)]
    return f'https://images.unsplash.com/photo-{photo_id}?w=800&h=1000&fit=crop&q=85&auto=format'


def download_shoe_photo(seed=0, style=0, cache=None):
    url = shoe_photo_url(seed, style)
    if cache is not None and url in cache:
        return cache[url]
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'EcomEarn-Seed/1.0'})
        with urllib.request.urlopen(req, timeout=30) as response:
            data = response.read()
        if len(data) < 5000:
            return None
        if cache is not None:
            cache[url] = data
        return data
    except (urllib.error.URLError, TimeoutError, OSError):
        return None


def generate_shoe_image(product_name, color_name='', seed=0, style=0):
    width, height = 800, 1000
    palette = ACCENT_PALETTES[seed % len(ACCENT_PALETTES)]
    color_hex = resolve_color_hex(color_name, '') or palette[1]
    top = _blend(_hex_to_rgb(palette[0]), _hex_to_rgb(color_hex), 0.35)
    bottom = _blend(_hex_to_rgb(palette[1]), _hex_to_rgb(color_hex), 0.55)

    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    for y in range(height):
        ratio = y / height
        row = _blend(top, bottom, ratio)
        draw.line([(0, y), (width, y)], fill=row)

    shoe_fill = _hex_to_rgb(resolve_color_hex(color_name, '') or '#111827')
    if color_name.lower() in ('white', 'grey', 'gray', 'silver', 'beige', 'cream'):
        shoe_fill = (55, 65, 81)
    outline = (255, 255, 255) if _luminance(shoe_fill) < 140 else (30, 41, 59)

    offset_x = 40 + (style % 3) * 12
    sole = [120 + offset_x, 670, 680 + offset_x, 760]
    draw.rounded_rectangle(sole, radius=40, fill=shoe_fill, outline=outline, width=3)
    body = [180 + offset_x, 500, 620 + offset_x, 690]
    draw.rounded_rectangle(body, radius=28, fill=shoe_fill, outline=outline, width=3)
    tongue = [300 + offset_x, 420, 500 + offset_x, 560]
    draw.ellipse(tongue, fill=shoe_fill, outline=outline, width=3)
    draw.arc([220 + offset_x, 520, 580 + offset_x, 700], start=200, end=340, fill=outline, width=4)
    draw.ellipse([500 + offset_x, 610, 560 + offset_x, 670], fill=outline)

    text_color = (255, 255, 255) if _luminance(top) < 150 else (17, 24, 39)
    title = product_name if len(product_name) <= 34 else f'{product_name[:31]}...'
    draw.text((48, 56), title, fill=text_color)
    if color_name:
        draw.text((48, 96), color_name, fill=text_color)

    buf = BytesIO()
    img.save(buf, format='JPEG', quality=90)
    return buf.getvalue()


class Command(BaseCommand):
    help = 'Seed ~100 demo shoe products with variants and images'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=100, help='Number of shoe products to create')
        parser.add_argument('--fresh', action='store_true', help='Delete existing shoe products first')
        parser.add_argument('--skip-images', action='store_true', help='Skip generating product images')
        parser.add_argument(
            '--images-only', action='store_true',
            help='Only (re)generate images for existing shoe products',
        )

    def handle(self, *args, **options):
        self.image_cache = {}
        shoes_cat = self._ensure_shoes_category()

        if options['images_only']:
            updated = self._refresh_all_images(shoes_cat)
            self.stdout.write(self.style.SUCCESS(f'Images refreshed for {updated} shoe products.'))
            return

        count = max(1, options['count'])
        skip_images = options['skip_images']
        brands = self._ensure_brands()

        if options['fresh']:
            self._clear_shoe_products(shoes_cat)

        catalog = self._build_catalog(count)
        created = 0
        skipped = 0

        for index, item in enumerate(catalog, start=1):
            sku = item['sku']
            if Product.objects.filter(sku=sku).exists():
                skipped += 1
                continue

            product = self._create_product(shoes_cat, brands[item['brand']], item, index)
            color_variants = self._create_variants(product, sku, item)
            if not skip_images:
                self._attach_images(product, sku, color_variants, index)
            created += 1

            if created % 10 == 0:
                self.stdout.write(f'  → {created} shoes created...')

        self.stdout.write(self.style.SUCCESS(
            f'Done: {created} shoe products created, {skipped} skipped (already exist).'
        ))

    def _ensure_shoes_category(self):
        cat, _ = Category.objects.get_or_create(
            slug='shoes',
            defaults={
                'name': 'Shoes',
                'description': 'Premium footwear collection',
                'icon': '👟',
                'display_order': 1,
                'meta_title': 'Shop Shoes - Ecom Earn Fashion',
                'meta_description': 'Browse our premium shoes collection',
                'is_active': True,
            },
        )
        cat.is_active = True
        cat.save(update_fields=['is_active'])

        size_fd, _ = FilterDefinition.objects.get_or_create(
            category=cat, slug='size',
            defaults={
                'name': 'Size', 'field_type': 'choice',
                'attribute_key': 'size', 'display_order': 2, 'is_active': True,
            },
        )
        for i, size in enumerate(SHOE_SIZES):
            FilterOption.objects.get_or_create(
                filter_definition=size_fd, value=size,
                defaults={'label': f'EU {size}', 'display_order': i},
            )
        return cat

    def _ensure_brands(self):
        brands = {}
        for name in SHOE_BRANDS:
            brand, _ = Brand.objects.get_or_create(name=name)
            brands[name] = brand
        return brands

    def _clear_shoe_products(self, shoes_cat):
        products = Product.objects.filter(category=shoes_cat)
        pids = list(products.values_list('id', flat=True))
        ProductImage.objects.filter(product_id__in=pids).delete()
        ProductVariant.objects.filter(product_id__in=pids).delete()
        deleted, _ = products.delete()
        self.stdout.write(f'Cleared {deleted} existing shoe records.')

    def _build_catalog(self, count):
        items = []
        brand_codes = {
            'Nike': 'NK', 'Adidas': 'AD', 'Puma': 'PM', 'Reebok': 'RB',
            'New Balance': 'NB', 'Converse': 'CV', 'Skechers': 'SK',
            'Asics': 'AS', 'Fila': 'FL', 'Bata': 'BT',
        }
        seq = 1
        for brand, models in SHOE_BRANDS.items():
            for model in models:
                if len(items) >= count:
                    return items
                code = brand_codes.get(brand, 'SH')
                items.append({
                    'name': f'{brand} {model}',
                    'brand': brand,
                    'sku': f'SH-{code}-{seq:04d}',
                    'gender': random.choice(SHOE_GENDERS),
                    'material': random.choice(SHOE_MATERIALS),
                    'featured': random.random() < 0.12,
                    'new_arrival': random.random() < 0.18,
                    'bestseller': random.random() < 0.15,
                    'trending': random.random() < 0.12,
                })
                seq += 1
        return items[:count]

    @transaction.atomic
    def _create_product(self, category, brand, item, index):
        base = 7999 + (index % 12) * 1000 + random.randint(0, 500)
        compare = base + random.randint(1500, 4000)
        return Product.objects.create(
            name=item['name'],
            category=category,
            brand=brand,
            description=(
                f'{item["name"]} — premium {item["material"].lower()} footwear built for comfort '
                f'and everyday style. Cushioned insole, durable outsole, and a modern silhouette '
                f'for {item["gender"]} wear.'
            ),
            short_description=f'Stylish {item["name"]} for everyday wear.',
            base_price=Decimal(str(base)),
            compare_price=Decimal(str(compare)),
            sku=item['sku'],
            gender=item['gender'],
            material=item['material'],
            specifications={
                'upper': item['material'],
                'sole': 'Rubber',
                'closure': random.choice(['Lace-up', 'Slip-on', 'Velcro']),
                'origin': 'Pakistan',
            },
            is_featured=item['featured'],
            is_new_arrival=item['new_arrival'],
            is_bestseller=item['bestseller'],
            is_trending=item['trending'],
            sales_count=random.randint(0, 120),
            meta_title=f'{item["name"]} - Ecom Earn Fashion',
        )

    def _create_variants(self, product, sku, item):
        num_colors = random.randint(2, 4)
        colors = random.sample(SHOE_COLORS, k=num_colors)
        color_variants = {}

        variant_index = 1
        for color in colors:
            num_sizes = random.randint(3, 5)
            sizes = sorted(random.sample(SHOE_SIZES, k=num_sizes), key=int)
            first_variant = None
            for size in sizes:
                variant = ProductVariant.objects.create(
                    product=product,
                    sku=f'{sku}-V{variant_index:02d}',
                    color=color,
                    color_hex=resolve_color_hex(color, ''),
                    size=size,
                    stock_quantity=random.randint(5, 30),
                    is_active=True,
                )
                if first_variant is None:
                    first_variant = variant
                    color_variants[color] = variant
                variant_index += 1

        return color_variants

    def _save_product_image(self, product, variant, filename, image_data, alt_text, is_primary, order):
        img = ProductImage(
            product=product,
            variant=variant,
            alt_text=alt_text,
            is_primary=is_primary,
            display_order=order,
        )
        img.image.save(filename, ContentFile(image_data), save=True)
        return img

    def _photo_bytes(self, product_name, seed, style, color_name=''):
        data = download_shoe_photo(seed, style, self.image_cache)
        if data:
            return data
        return generate_shoe_image(product_name, color_name=color_name, seed=seed, style=style)

    def _attach_images(self, product, sku, color_variants, index, replace=False):
        if replace:
            ProductImage.objects.filter(product=product).delete()

        primary_data = self._photo_bytes(product.name, index, 0)
        self._save_product_image(
            product, None, f'{sku}-main.jpg', primary_data,
            f'{product.name} main', is_primary=True, order=0,
        )

        secondary_data = self._photo_bytes(product.name, index + 3, 1)
        self._save_product_image(
            product, None, f'{sku}-side.jpg', secondary_data,
            f'{product.name} side view', is_primary=False, order=1,
        )

        for color_idx, (color, variant) in enumerate(color_variants.items()):
            color_slug = color.lower().replace(' ', '-')
            data = self._photo_bytes(
                product.name, index + color_idx, 2 + color_idx, color_name=color,
            )
            self._save_product_image(
                product, variant, f'{sku}-{color_slug}.jpg', data,
                f'{product.name} {color}', is_primary=False, order=10 + color_idx,
            )

    def _refresh_all_images(self, shoes_cat):
        products = Product.objects.filter(category=shoes_cat).prefetch_related('variants')
        updated = 0
        for index, product in enumerate(products.order_by('id'), start=1):
            color_variants = {}
            for variant in product.variants.order_by('id'):
                if variant.color and variant.color not in color_variants:
                    color_variants[variant.color] = variant
            self._attach_images(product, product.sku, color_variants, index, replace=True)
            updated += 1
            if updated % 20 == 0:
                self.stdout.write(f'  → {updated} image sets generated...')
        return updated

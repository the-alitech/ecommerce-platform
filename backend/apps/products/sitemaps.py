from django.contrib.sitemaps import Sitemap
from .querysets import storefront_products
from apps.categories.querysets import storefront_categories


class ProductSitemap(Sitemap):
    changefreq = 'weekly'
    priority = 0.8

    def items(self):
        return storefront_products()

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return f'/products/{obj.slug}'


class CategorySitemap(Sitemap):
    changefreq = 'weekly'
    priority = 0.7

    def items(self):
        return storefront_categories().filter(parent__isnull=True)

    def location(self, obj):
        return f'/shop/{obj.slug}'

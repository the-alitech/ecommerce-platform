from django.db import models


class Banner(models.Model):
    BANNER_TYPES = [
        ('hero', 'Hero Slider'),
        ('promo', 'Promotional'),
        ('sidebar', 'Sidebar'),
    ]

    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True)
    image = models.ImageField(upload_to='banners/', blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, help_text='External image URL (used if no file uploaded)')
    link = models.CharField(max_length=500, blank=True)
    banner_type = models.CharField(max_length=20, choices=BANNER_TYPES, default='hero')
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return self.title


class Testimonial(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100, blank=True)
    content = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)
    image = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return self.name


class PageContent(models.Model):
    PAGE_TYPES = [
        ('about', 'About Us'),
        ('contact', 'Contact'),
        ('terms', 'Terms & Conditions'),
        ('privacy', 'Privacy Policy'),
        ('payment_instructions', 'Payment Instructions'),
    ]

    page_type = models.CharField(max_length=30, choices=PAGE_TYPES, unique=True)
    title = models.CharField(max_length=200)
    content = models.TextField()
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.get_page_type_display()


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email


class PaymentAccount(models.Model):
    """Admin-managed payment account details shown at checkout."""

    METHOD_CHOICES = [
        ('bank_transfer', 'Bank Transfer'),
        ('jazzcash', 'JazzCash'),
        ('easypaisa', 'Easypaisa'),
    ]

    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    title = models.CharField(
        max_length=100,
        help_text='Display label, e.g. JazzCash or HBL Bank',
    )
    account_title = models.CharField(
        max_length=150,
        blank=True,
        help_text='Account holder name',
    )
    account_number = models.CharField(
        max_length=50,
        help_text='Mobile wallet number or bank account number',
    )
    bank_name = models.CharField(max_length=100, blank=True)
    iban = models.CharField(max_length=50, blank=True)
    instructions = models.TextField(
        blank=True,
        help_text='Extra note shown under this account at checkout',
    )
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'method', 'id']

    def __str__(self):
        return f'{self.get_method_display()} — {self.account_number}'


class SiteSettings(models.Model):
    site_name = models.CharField(max_length=100, default='H.B Shoes')
    tagline = models.CharField(max_length=200, blank=True)
    logo = models.ImageField(upload_to='site/', blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    whatsapp_number = models.CharField(max_length=20, blank=True)
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    bank_name = models.CharField(
        max_length=100, blank=True,
        help_text='Deprecated: use Payment Accounts table instead.',
    )
    bank_account = models.CharField(
        max_length=50, blank=True,
        help_text='Deprecated: use Payment Accounts table instead.',
    )
    bank_iban = models.CharField(
        max_length=50, blank=True,
        help_text='Deprecated: use Payment Accounts table instead.',
    )
    jazzcash_number = models.CharField(
        max_length=20, blank=True,
        help_text='Deprecated: use Payment Accounts table instead.',
    )
    easypaisa_number = models.CharField(
        max_length=20, blank=True,
        help_text='Deprecated: use Payment Accounts table instead.',
    )
    google_maps_embed = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return self.site_name

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, max_length=120)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True,
        related_name='subcategories'
    )
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, help_text='Icon class or emoji')
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def is_parent(self):
        return self.parent is None


class FilterDefinition(models.Model):
    FIELD_TYPES = [
        ('choice', 'Single Choice'),
        ('multi_choice', 'Multiple Choice'),
        ('range', 'Price/Number Range'),
        ('boolean', 'Yes/No'),
        ('text', 'Text Search'),
    ]

    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name='filter_definitions'
    )
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES, default='choice')
    attribute_key = models.CharField(
        max_length=50,
        help_text='Key used in product/variant attributes, e.g. brand, color, size'
    )
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', 'name']
        unique_together = ['category', 'slug']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category.name} - {self.name}"


class FilterOption(models.Model):
    filter_definition = models.ForeignKey(
        FilterDefinition, on_delete=models.CASCADE, related_name='options'
    )
    label = models.CharField(max_length=100)
    value = models.CharField(max_length=100)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'label']

    def __str__(self):
        return self.label

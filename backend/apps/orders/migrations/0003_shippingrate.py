# Generated manually for ShippingRate model

from decimal import Decimal

from django.db import migrations, models
from django.utils.text import slugify


def seed_shipping_rates(apps, schema_editor):
    ShippingRate = apps.get_model('orders', 'ShippingRate')
    defaults = [
        ('Lahore', 'lahore', Decimal('150'), 0, False),
        ('Faisalabad', 'faisalabad', Decimal('120'), 1, False),
        ('Islamabad', 'islamabad', Decimal('180'), 2, False),
        ('Karachi', 'karachi', Decimal('200'), 3, False),
        ('Other Cities', 'other-cities', Decimal('250'), 99, True),
    ]
    for city, slug, charge, order, is_default in defaults:
        ShippingRate.objects.get_or_create(
            slug=slug,
            defaults={
                'city': city,
                'charge': charge,
                'display_order': order,
                'is_default': is_default,
                'is_active': True,
            },
        )


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0002_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ShippingRate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('city', models.CharField(max_length=100)),
                ('slug', models.SlugField(max_length=120, unique=True)),
                ('charge', models.DecimalField(decimal_places=2, max_digits=10)),
                ('is_default', models.BooleanField(default=False, help_text='Used when the customer city does not match any configured rate.')),
                ('is_active', models.BooleanField(default=True)),
                ('display_order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['display_order', 'city'],
            },
        ),
        migrations.RunPython(seed_shipping_rates, migrations.RunPython.noop),
    ]

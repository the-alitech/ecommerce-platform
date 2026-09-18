# Generated manually for PaymentAccount model

from django.db import migrations, models


def seed_payment_accounts(apps, schema_editor):
    PaymentAccount = apps.get_model('content', 'PaymentAccount')
    SiteSettings = apps.get_model('content', 'SiteSettings')
    settings = SiteSettings.objects.filter(pk=1).first()

    bank_name = (settings.bank_name if settings else '') or 'HBL Bank'
    bank_account = (settings.bank_account if settings else '') or '12345678901234'
    bank_iban = (settings.bank_iban if settings else '') or 'PK36HABB0001234567890123'
    jazzcash = (settings.jazzcash_number if settings else '') or '03001234567'
    easypaisa = (settings.easypaisa_number if settings else '') or '03001234567'

    defaults = [
        {
            'method': 'bank_transfer',
            'title': bank_name,
            'account_title': 'Ecom Earn Fashion',
            'account_number': bank_account,
            'bank_name': bank_name,
            'iban': bank_iban,
            'instructions': 'Transfer the exact order amount and share the receipt screenshot with admin.',
            'display_order': 1,
        },
        {
            'method': 'jazzcash',
            'title': 'JazzCash',
            'account_title': 'Ecom Earn Fashion',
            'account_number': jazzcash,
            'bank_name': '',
            'iban': '',
            'instructions': 'Send payment via JazzCash and share the screenshot with admin.',
            'display_order': 2,
        },
        {
            'method': 'easypaisa',
            'title': 'Easypaisa',
            'account_title': 'Ecom Earn Fashion',
            'account_number': easypaisa,
            'bank_name': '',
            'iban': '',
            'instructions': 'Send payment via Easypaisa and share the screenshot with admin.',
            'display_order': 3,
        },
    ]

    for item in defaults:
        PaymentAccount.objects.get_or_create(
            method=item['method'],
            account_number=item['account_number'],
            defaults=item,
        )


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0002_banner_image_url_alter_banner_image'),
    ]

    operations = [
        migrations.CreateModel(
            name='PaymentAccount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('method', models.CharField(choices=[('bank_transfer', 'Bank Transfer'), ('jazzcash', 'JazzCash'), ('easypaisa', 'Easypaisa')], max_length=20)),
                ('title', models.CharField(help_text='Display label, e.g. JazzCash or HBL Bank', max_length=100)),
                ('account_title', models.CharField(blank=True, help_text='Account holder name', max_length=150)),
                ('account_number', models.CharField(help_text='Mobile wallet number or bank account number', max_length=50)),
                ('bank_name', models.CharField(blank=True, max_length=100)),
                ('iban', models.CharField(blank=True, max_length=50)),
                ('instructions', models.TextField(blank=True, help_text='Extra note shown under this account at checkout')),
                ('is_active', models.BooleanField(default=True)),
                ('display_order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['display_order', 'method', 'id'],
            },
        ),
        migrations.RunPython(seed_payment_accounts, migrations.RunPython.noop),
    ]

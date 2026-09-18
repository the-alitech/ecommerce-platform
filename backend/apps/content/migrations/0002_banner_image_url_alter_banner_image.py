from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='banner',
            name='image_url',
            field=models.URLField(blank=True, help_text='External image URL (used if no file uploaded)', max_length=500),
        ),
        migrations.AlterField(
            model_name='banner',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='banners/'),
        ),
    ]

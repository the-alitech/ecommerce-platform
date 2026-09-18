from django.db import models
from django.db.models import Sum
from django.conf import settings
from apps.products.models import ProductVariant


class Cart(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        null=True, blank=True, related_name='carts'
    )
    session_key = models.CharField(max_length=40, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        if self.user:
            return f"Cart - {self.user.email}"
        return f"Cart - {self.session_key}"

    @property
    def total_items(self):
        return self.items.filter(saved_for_later=False).aggregate(
            total=Sum('quantity')
        )['total'] or 0

    @property
    def subtotal(self):
        total = 0
        for item in self.items.filter(saved_for_later=False):
            total += item.line_total
        return total


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    saved_for_later = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['cart', 'variant', 'saved_for_later']

    def __str__(self):
        return f"{self.variant} x {self.quantity}"

    @property
    def line_total(self):
        return self.variant.effective_price * self.quantity

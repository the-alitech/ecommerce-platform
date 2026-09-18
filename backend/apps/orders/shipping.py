from decimal import Decimal

from django.utils.text import slugify

from .models import ShippingRate

FALLBACK_SHIPPING = Decimal('250')


def normalize_city_key(city: str) -> str:
    key = (city or '').strip().lower().replace('-', ' ').replace('_', ' ')
    key = ' '.join(key.split())
    return slugify(key) or key.replace(' ', '')


def _active_rates():
    return ShippingRate.objects.filter(is_active=True)


def calculate_shipping_cost(city: str) -> Decimal:
    if not city:
        return _default_charge()

    key = normalize_city_key(city)
    rates = _active_rates()

    rate = rates.filter(slug=key).first()
    if rate:
        return rate.charge

    rate = rates.filter(city__iexact=city.strip()).first()
    if rate:
        return rate.charge

    return _default_charge()


def _default_charge() -> Decimal:
    default = _active_rates().filter(is_default=True).first()
    if default:
        return default.charge
    first = _active_rates().order_by('display_order', 'city').first()
    if first:
        return first.charge
    return FALLBACK_SHIPPING


def get_shipping_rates():
    rates = []
    for rate in _active_rates().filter(is_default=False).order_by('display_order', 'city'):
        rates.append({
            'id': rate.id,
            'city': rate.city,
            'city_key': rate.slug,
            'rate': float(rate.charge),
            'is_default': False,
        })

    default = _active_rates().filter(is_default=True).first()
    if default:
        rates.append({
            'id': default.id,
            'city': default.city,
            'city_key': default.slug,
            'rate': float(default.charge),
            'is_default': True,
        })
    elif not rates:
        rates.append({
            'id': None,
            'city': 'Standard Shipping',
            'city_key': 'other',
            'rate': float(FALLBACK_SHIPPING),
            'is_default': True,
        })
    return rates

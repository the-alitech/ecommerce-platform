COLOR_NAME_TO_HEX = {
    'black': '#171717',
    'white': '#F5F5F5',
    'red': '#EF4444',
    'blue': '#3B82F6',
    'green': '#22C55E',
    'yellow': '#EAB308',
    'orange': '#F97316',
    'purple': '#A855F7',
    'pink': '#EC4899',
    'brown': '#92400E',
    'beige': '#D4C4A8',
    'tan': '#D2B48C',
    'khaki': '#C3B091',
    'navy': '#1E3A5F',
    'grey': '#9CA3AF',
    'gray': '#9CA3AF',
    'silver': '#C0C0C0',
    'gold': '#D4A843',
    'maroon': '#7F1D1D',
    'teal': '#14B8A6',
    'cyan': '#06B6D4',
    'lime': '#84CC16',
    'olive': '#65A30D',
    'cream': '#FFFDD0',
    'ivory': '#FFFFF0',
}


def resolve_color_hex(color: str = '', color_hex: str = '') -> str:
    hex_val = (color_hex or '').strip()
    if hex_val:
        if not hex_val.startswith('#'):
            hex_val = f'#{hex_val}'
        return hex_val[:7]

    name = (color or '').strip().lower()
    if not name:
        return ''

    compact = name.replace(' ', '').replace('-', '')
    if compact in COLOR_NAME_TO_HEX:
        return COLOR_NAME_TO_HEX[compact]

    for key, value in COLOR_NAME_TO_HEX.items():
        if key in compact or compact in key:
            return value

    words = name.split()
    for word in words:
        if word in COLOR_NAME_TO_HEX:
            return COLOR_NAME_TO_HEX[word]

    return ''

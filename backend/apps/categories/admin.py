from django.contrib import admin
from .models import Category, FilterDefinition, FilterOption


class FilterOptionInline(admin.TabularInline):
    model = FilterOption
    extra = 1


class FilterDefinitionInline(admin.StackedInline):
    model = FilterDefinition
    extra = 0
    show_change_link = True


class SubcategoryInline(admin.TabularInline):
    model = Category
    fk_name = 'parent'
    extra = 0
    fields = ['name', 'slug', 'is_active', 'display_order']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'parent', 'is_active', 'display_order']
    list_filter = ['is_active', 'parent']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [SubcategoryInline, FilterDefinitionInline]


@admin.register(FilterDefinition)
class FilterDefinitionAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'field_type', 'attribute_key', 'is_active']
    list_filter = ['category', 'field_type', 'is_active']
    inlines = [FilterOptionInline]


@admin.register(FilterOption)
class FilterOptionAdmin(admin.ModelAdmin):
    list_display = ['label', 'value', 'filter_definition', 'display_order']
    list_filter = ['filter_definition__category']

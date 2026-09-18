'use client';

import type { FilterDefinition, ProductFacets } from '@/lib/api';

interface ProductFiltersProps {
  filters: FilterDefinition[];
  facets?: ProductFacets | null;
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
}

const PILL_FILTER_KEYS = new Set(['size', 'waist_size', 'color']);

function mergeSizeOptions(
  filterDef: FilterDefinition | undefined,
  facetValues: string[] = []
): string[] {
  const fromDef = filterDef?.options.map((o) => o.value) || [];
  const merged = new Set([...fromDef, ...facetValues]);
  return Array.from(merged).sort((a, b) => {
    const aNum = /^\d+$/.test(a);
    const bNum = /^\d+$/.test(b);
    if (aNum && bNum) return parseInt(a, 10) - parseInt(b, 10);
    if (aNum) return -1;
    if (bNum) return 1;
    return a.localeCompare(b);
  });
}

function SizePills({
  label,
  filterKey,
  options,
  activeValue,
  onSelect,
}: {
  label: string;
  filterKey: string;
  options: string[];
  activeValue?: string;
  onSelect: (key: string, value: string) => void;
}) {
  if (!options.length) return null;

  return (
    <div>
      <h4 className="mb-3 text-sm font-medium text-brand-700">{label}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((size) => {
          const selected = activeValue === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelect(filterKey, selected ? '' : size)}
              className={`min-w-[2.75rem] rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 ${
                selected
                  ? 'border-brand-900 bg-brand-900 text-white shadow-glow-sm scale-105'
                  : 'border-brand-200 bg-white text-brand-700 hover:border-accent-400 hover:text-accent-700 hover:-translate-y-0.5'
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProductFilters({
  filters,
  facets,
  activeFilters,
  onFilterChange,
  onClear,
}: ProductFiltersProps) {
  const sizeFilter = filters.find((f) => f.attribute_key === 'size');
  const waistFilter = filters.find((f) => f.attribute_key === 'waist_size');
  const sizeOptions = mergeSizeOptions(sizeFilter, facets?.sizes);
  const waistOptions = mergeSizeOptions(waistFilter, facets?.waist_sizes);

  const otherFilters = filters.filter(
    (f) => !PILL_FILTER_KEYS.has(f.attribute_key)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-brand-900">Filters</h3>
        <button onClick={onClear} className="text-sm text-brand-500 hover:text-brand-700">
          Clear All
        </button>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium text-brand-700">Price Range</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            className="input-field"
            value={activeFilters.min_price || ''}
            onChange={(e) => onFilterChange('min_price', e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            className="input-field"
            value={activeFilters.max_price || ''}
            onChange={(e) => onFilterChange('max_price', e.target.value)}
          />
        </div>
      </div>

      <SizePills
        label={sizeFilter?.name || 'Size'}
        filterKey="size"
        options={sizeOptions}
        activeValue={activeFilters.size}
        onSelect={onFilterChange}
      />

      <SizePills
        label={waistFilter?.name || 'Waist Size'}
        filterKey="waist_size"
        options={waistOptions}
        activeValue={activeFilters.waist_size}
        onSelect={onFilterChange}
      />

      {otherFilters.map((filter) => {
        if (filter.attribute_key === 'color') {
          const colorOptions = mergeSizeOptions(filter, facets?.colors);
          return (
            <SizePills
              key={filter.id}
              label={filter.name}
              filterKey="color"
              options={colorOptions}
              activeValue={activeFilters.color}
              onSelect={onFilterChange}
            />
          );
        }

        return (
          <div key={filter.id}>
            <h4 className="mb-3 text-sm font-medium text-brand-700">{filter.name}</h4>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {filter.options.map((opt) => (
                <label key={opt.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={activeFilters[filter.attribute_key] === opt.value}
                    onChange={() =>
                      onFilterChange(
                        filter.attribute_key,
                        activeFilters[filter.attribute_key] === opt.value ? '' : opt.value
                      )
                    }
                    className="rounded border-brand-300 text-brand-900 focus:ring-brand-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        );
      })}

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={activeFilters.in_stock === 'true'}
          onChange={() => onFilterChange('in_stock', activeFilters.in_stock === 'true' ? '' : 'true')}
          className="rounded border-brand-300 text-brand-900 focus:ring-brand-500"
        />
        In Stock Only
      </label>
    </div>
  );
}

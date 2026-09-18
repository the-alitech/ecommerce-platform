'use client';

import { useEffect, useState } from 'react';
import { adminApi, type AdminShippingRate } from '@/lib/admin-api';
import { Plus, Pencil, Trash2, Truck } from 'lucide-react';

const emptyForm = {
  city: '',
  slug: '',
  charge: '',
  is_default: false,
  is_active: true,
  display_order: '0',
};

export default function ShippingPage() {
  const [rates, setRates] = useState<AdminShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const loadRates = () => {
    setLoading(true);
    adminApi<AdminShippingRate[]>('/dashboard/shipping/')
      .then(setRates)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load shipping rates'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRates();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      city: form.city.trim(),
      slug: form.slug.trim() || undefined,
      charge: form.charge,
      is_default: form.is_default,
      is_active: form.is_active,
      display_order: Number(form.display_order || 0),
    };
    try {
      if (editingId) {
        await adminApi(`/dashboard/shipping/${editingId}/`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await adminApi('/dashboard/shipping/', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      resetForm();
      loadRates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save shipping rate');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (rate: AdminShippingRate) => {
    setEditingId(rate.id);
    setForm({
      city: rate.city,
      slug: rate.slug,
      charge: rate.charge,
      is_default: rate.is_default,
      is_active: rate.is_active,
      display_order: String(rate.display_order),
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this shipping rate?')) return;
    setError('');
    try {
      await adminApi(`/dashboard/shipping/${id}/`, { method: 'DELETE' });
      if (editingId === id) resetForm();
      loadRates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete shipping rate');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <Truck className="h-7 w-7 text-indigo-700" />
        <div>
          <h1 className="text-2xl font-bold">Shipping Rates</h1>
          <p className="text-gray-600">Manage city-wise delivery charges shown at checkout.</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-[360px_1fr]">
        <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 shadow-sm h-fit">
          <h2 className="font-semibold text-lg">{editingId ? 'Edit Rate' : 'Add City Rate'}</h2>
          <div className="mt-4 space-y-4">
            <input
              className="w-full rounded-lg border px-3 py-2"
              placeholder="City name"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
            <input
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Slug (optional)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="number"
              min="0"
              step="0.01"
              placeholder="Shipping charge (PKR)"
              value={form.charge}
              onChange={(e) => setForm({ ...form, charge: e.target.value })}
              required
            />
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="number"
              min="0"
              placeholder="Display order"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              />
              Default rate for unmatched cities
            </label>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-900 px-4 py-2 text-white hover:bg-indigo-800 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {saving ? 'Saving...' : editingId ? 'Update Rate' : 'Add Rate'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded-lg border px-4 py-2">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b px-6 py-4 font-semibold">Configured Cities</div>
          {loading ? (
            <p className="p-6 text-gray-500">Loading shipping rates...</p>
          ) : rates.length === 0 ? (
            <p className="p-6 text-gray-500">No shipping rates yet. Add your first city above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-6 py-3">City</th>
                    <th className="px-6 py-3">Slug</th>
                    <th className="px-6 py-3">Charge</th>
                    <th className="px-6 py-3">Default</th>
                    <th className="px-6 py-3">Active</th>
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => (
                    <tr key={rate.id} className="border-t">
                      <td className="px-6 py-4 font-medium">{rate.city}</td>
                      <td className="px-6 py-4 text-gray-500">{rate.slug}</td>
                      <td className="px-6 py-4">PKR {Number(rate.charge).toLocaleString('en-PK')}</td>
                      <td className="px-6 py-4">{rate.is_default ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4">{rate.is_active ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4">{rate.display_order}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(rate)}
                            className="rounded-md border p-2 hover:bg-gray-50"
                            aria-label={`Edit ${rate.city}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rate.id)}
                            className="rounded-md border p-2 text-red-600 hover:bg-red-50"
                            aria-label={`Delete ${rate.city}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

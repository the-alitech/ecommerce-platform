'use client';

import { useEffect, useState } from 'react';
import { adminApi, type AdminPaymentAccount } from '@/lib/admin-api';
import { Plus, Pencil, Trash2, CreditCard } from 'lucide-react';

const METHOD_OPTIONS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'jazzcash', label: 'JazzCash' },
  { value: 'easypaisa', label: 'Easypaisa' },
];

const emptyForm = {
  method: 'jazzcash',
  title: '',
  account_title: '',
  account_number: '',
  bank_name: '',
  iban: '',
  instructions: '',
  is_active: true,
  display_order: '0',
};

export default function PaymentAccountsPage() {
  const [accounts, setAccounts] = useState<AdminPaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const loadAccounts = () => {
    setLoading(true);
    adminApi<AdminPaymentAccount[]>('/dashboard/payment-accounts/')
      .then(setAccounts)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load payment accounts'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAccounts();
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
      method: form.method,
      title: form.title.trim(),
      account_title: form.account_title.trim(),
      account_number: form.account_number.trim(),
      bank_name: form.bank_name.trim(),
      iban: form.iban.trim(),
      instructions: form.instructions.trim(),
      is_active: form.is_active,
      display_order: Number(form.display_order || 0),
    };
    try {
      if (editingId) {
        await adminApi(`/dashboard/payment-accounts/${editingId}/`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await adminApi('/dashboard/payment-accounts/', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      resetForm();
      loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save payment account');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (account: AdminPaymentAccount) => {
    setEditingId(account.id);
    setForm({
      method: account.method,
      title: account.title,
      account_title: account.account_title || '',
      account_number: account.account_number,
      bank_name: account.bank_name || '',
      iban: account.iban || '',
      instructions: account.instructions || '',
      is_active: account.is_active,
      display_order: String(account.display_order),
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this payment account?')) return;
    setError('');
    try {
      await adminApi(`/dashboard/payment-accounts/${id}/`, { method: 'DELETE' });
      if (editingId === id) resetForm();
      loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment account');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <CreditCard className="h-7 w-7 text-indigo-700" />
        <div>
          <h1 className="text-2xl font-bold">Payment Accounts</h1>
          <p className="text-gray-600">
            Manage bank, JazzCash, and Easypaisa details shown at checkout.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-[400px_1fr]">
        <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 shadow-sm h-fit">
          <h2 className="font-semibold text-lg">{editingId ? 'Edit Account' : 'Add Account'}</h2>
          <div className="mt-4 space-y-4">
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              required
            >
              {METHOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Display title (e.g. JazzCash / HBL Bank)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <input
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Account title / holder name"
              value={form.account_title}
              onChange={(e) => setForm({ ...form, account_title: e.target.value })}
            />
            <input
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Account / wallet number"
              value={form.account_number}
              onChange={(e) => setForm({ ...form, account_number: e.target.value })}
              required
            />
            {form.method === 'bank_transfer' && (
              <>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Bank name"
                  value={form.bank_name}
                  onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                />
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="IBAN"
                  value={form.iban}
                  onChange={(e) => setForm({ ...form, iban: e.target.value })}
                />
              </>
            )}
            <textarea
              className="w-full rounded-lg border px-3 py-2"
              rows={3}
              placeholder="Checkout instructions (optional)"
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
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
              Active (shown at checkout)
            </label>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-900 px-4 py-2 text-white hover:bg-indigo-800 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {saving ? 'Saving...' : editingId ? 'Update Account' : 'Add Account'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded-lg border px-4 py-2">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b px-6 py-4 font-semibold">Configured Accounts</div>
          {loading ? (
            <p className="p-6 text-gray-500">Loading payment accounts...</p>
          ) : accounts.length === 0 ? (
            <p className="p-6 text-gray-500">No payment accounts yet. Add your first account above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-6 py-3">Method</th>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Number</th>
                    <th className="px-6 py-3">Active</th>
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.id} className="border-t">
                      <td className="px-6 py-4 font-medium">{account.method_display}</td>
                      <td className="px-6 py-4">{account.title}</td>
                      <td className="px-6 py-4 text-gray-700">{account.account_number}</td>
                      <td className="px-6 py-4">{account.is_active ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4">{account.display_order}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(account)}
                            className="rounded-md border p-2 hover:bg-gray-50"
                            aria-label={`Edit ${account.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(account.id)}
                            className="rounded-md border p-2 text-red-600 hover:bg-red-50"
                            aria-label={`Delete ${account.title}`}
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

'use client';

export default function CouponsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Coupon Management</h1>
      <p className="mt-4 text-gray-600">Create percentage and fixed discounts with expiry dates.</p>
      <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:2000'}/admin/coupons/coupon/`} target="_blank" rel="noopener"
        className="mt-6 inline-block bg-indigo-900 text-white px-6 py-3 rounded-lg hover:bg-indigo-800">
        Manage Coupons in Django Admin →
      </a>
    </div>
  );
}

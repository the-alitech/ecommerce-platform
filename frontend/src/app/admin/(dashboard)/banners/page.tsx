'use client';

export default function BannersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Banner Management</h1>
      <p className="mt-4 text-gray-600">Manage hero sliders and promotional banners.</p>
      <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:2000'}/admin/content/banner/`} target="_blank" rel="noopener"
        className="mt-6 inline-block bg-indigo-900 text-white px-6 py-3 rounded-lg hover:bg-indigo-800">
        Manage Banners in Django Admin →
      </a>
    </div>
  );
}

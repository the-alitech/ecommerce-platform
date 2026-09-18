'use client';

export default function ContentPage() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:2000';
  const links = [
    { label: 'About Page', url: `${base}/admin/content/pagecontent/` },
    { label: 'Testimonials', url: `${base}/admin/content/testimonial/` },
    { label: 'Site Settings', url: `${base}/admin/content/sitesettings/` },
    { label: 'Newsletter Subscribers', url: `${base}/admin/content/newslettersubscriber/` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Content Management</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {links.map((l) => (
          <a key={l.label} href={l.url} target="_blank" rel="noopener"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
            <h3 className="font-semibold">{l.label}</h3>
            <p className="text-sm text-gray-500 mt-1">Edit in Django Admin →</p>
          </a>
        ))}
      </div>
    </div>
  );
}

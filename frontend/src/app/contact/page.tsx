'use client';

import { useState } from 'react';
import { MessageCircle, Mail, Phone, MapPin } from 'lucide-react';
import { whatsappLink } from '@/lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923001234567';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2000/api';
      const res = await fetch(`${API_URL}/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title text-center">Contact Us</h1>
      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div>
          <form onSubmit={handleSubmit} className="card p-8 space-y-4">
            <input className="input-field" placeholder="Your Name" required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input type="email" className="input-field" placeholder="Email" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="input-field" placeholder="Phone"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input-field" placeholder="Subject" required
              value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <textarea className="input-field min-h-[120px]" placeholder="Message" required
              value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            {status === 'success' && <p className="text-sm text-green-600">Message sent successfully!</p>}
            {status === 'error' && <p className="text-sm text-red-600">Failed to send. Please try again.</p>}
            <button type="submit" className="btn-primary w-full" disabled={status === 'loading'}>Send Message</button>
          </form>
        </div>
        <div className="space-y-8">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Business Information</h2>
            <div className="flex items-center gap-3 text-brand-600"><Phone className="h-5 w-5" /> +92 300 1234567</div>
            <div className="flex items-center gap-3 text-brand-600"><Mail className="h-5 w-5" /> info@ecom-earn.com</div>
            <div className="flex items-start gap-3 text-brand-600"><MapPin className="h-5 w-5 shrink-0" /> 123 Fashion Street, Gulberg III, Lahore, Pakistan</div>
            <a href={whatsappLink(waNumber, 'Hello, I have a question.')} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </div>
          <div className="card overflow-hidden">
            <iframe
              src={process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL || 'https://www.google.com/maps/embed?pb=!1m18'}
              width="100%" height="300" style={{ border: 0 }} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" title="Store Location"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

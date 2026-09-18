import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-footer-gradient text-brand-300">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(124,58,237,0.15)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(236,72,153,0.08)_0%,_transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-1">
              <span className="font-display text-2xl font-bold text-white">H.B</span>
              <span className="font-display text-2xl font-bold text-accent-400">Shoes</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-brand-400">
              Premium footwear destination — quality shoes for every style, curated for the modern wardrobe.
            </p>
            <div className="mt-6 flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-700/50 text-brand-400 transition hover:border-accent-500 hover:bg-accent-600/20 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-white">
              <Sparkles className="h-4 w-4 text-accent-400" /> Shop
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {['shoes', 'shirts', 'trousers', 'bags'].map((cat) => (
                <li key={cat}>
                  <Link href={`/shop/${cat}`} className="capitalize text-brand-400 transition hover:text-accent-300">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">Customer Service</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/contact" className="text-brand-400 hover:text-accent-300 transition">Contact Us</Link></li>
              <li><Link href="/track-order" className="text-brand-400 hover:text-accent-300 transition">Track Order</Link></li>
              <li><Link href="/about" className="text-brand-400 hover:text-accent-300 transition">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">Newsletter</h4>
            <p className="mt-4 text-sm text-brand-400">Exclusive drops &amp; early access to sales.</p>
            <form className="mt-4 flex gap-2" action="/api/content/newsletter" method="POST">
              <input
                type="email"
                name="email"
                placeholder="Your email"
                className="flex-1 rounded-xl border border-brand-700/50 bg-brand-900/50 px-3 py-2.5 text-sm text-white placeholder-brand-500 backdrop-blur-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                required
              />
              <button
                type="submit"
                className="rounded-xl bg-accent-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow-sm transition hover:shadow-glow"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-brand-800/80 pt-8 text-sm text-brand-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} H.B Shoes. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-accent-400 transition">Privacy</Link>
            <Link href="/about" className="hover:text-accent-400 transition">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

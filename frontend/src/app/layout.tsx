import type { Metadata } from 'next';
import { DM_Sans, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/providers/CartProvider';
import { StoreShell } from '@/components/layout/StoreShell';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'H.B Shoes - Premium Footwear',
    template: '%s | H.B Shoes',
  },
  description: 'Shop premium shoes and footwear. Quality style for every step.',
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    siteName: 'H.B Shoes',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${cormorant.variable}`}>
      <body className="min-h-screen flex flex-col font-sans">
        <CartProvider>
          <StoreShell>{children}</StoreShell>
        </CartProvider>
      </body>
    </html>
  );
}

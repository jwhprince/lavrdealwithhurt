import type { Metadata, Viewport } from 'next';
import '@fontsource/manrope/cyrillic-400.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/cyrillic-500.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/cyrillic-600.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/cormorant-garamond/cyrillic-500.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/cyrillic-500-italic.css';
import '@fontsource/cormorant-garamond/latin-500-italic.css';
import './globals.css';
import { site, siteUrl, indexable, leadsEnabled, metrikaId } from '@/lib/site';
import { BookingProvider } from '@/components/booking';
import { Analytics } from '@/components/analytics';

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: { default: site.title, template: '%s | VOLTA' }, description: site.description,
  robots: { index: indexable, follow: indexable },
  openGraph: { type: 'website', locale: 'ru_RU', siteName: 'VOLTA — школа танцев', title: site.title,
    description: site.description, ...(siteUrl ? { url: siteUrl, images: [{ url: `${siteUrl}/images/social.jpg`, width: 1200, height: 630, alt: 'Школа танцев VOLTA' }] } : {}) },
  twitter: { card: 'summary_large_image' },
  verification: { yandex: process.env.YANDEX_VERIFICATION || undefined },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#76172f' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>
    <a className="skip-link" href="#main">Перейти к содержанию</a>
    <BookingProvider enabled={leadsEnabled} phone={site.phone} email={site.email} metrikaId={metrikaId}>
      {children}
    </BookingProvider>
    {metrikaId && <Analytics id={metrikaId} />}
  </body></html>;
}

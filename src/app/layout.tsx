import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://midika.it'),
  title: {
    default: 'MiDika — Italian software house',
    template: '%s — MiDika',
  },
  description: 'Italian software house focused on minimalism and design.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://midika.it/',
    title: 'MiDika — Italian software house',
    description: 'Italian software house focused on minimalism and design.',
    images: [{ url: '/og.jpg', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MiDika — Italian software house',
    description: 'Italian software house focused on minimalism and design.',
    images: ['/og.jpg'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className={`${GeistSans.className} antialiased`}>
        {children}
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'MiDika',
              url: 'https://midika.it/',
              logo: 'https://midika.it/logo.png',
              description:
                'Italian software house focused on minimalism and design.',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              url: 'https://midika.it/',
              name: 'MiDika',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://midika.it/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}

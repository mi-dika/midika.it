import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import { StarsBackground } from '@/components/ui/stars-background';
import { ShootingStars } from '@/components/ui/shooting-stars';
import { LanguageProvider } from '@/lib/language-context';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://midika.it'),
  title: {
    default: 'MiDika — Italian software house',
    template: '%s — MiDika',
  },
  description: 'Italian software house',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://midika.it/',
    title: 'MiDika — Italian software house',
    description: 'Italian software house',
    images: [{ url: '/og.jpg', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MiDika — Italian software house',
    description: 'Italian software house',
    images: ['/og.jpg'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
      <body
        className={`${GeistSans.className} antialiased bg-black text-white`}
        suppressHydrationWarning
      >
        <LanguageProvider>
          <div className="fixed inset-0 z-0 pointer-events-none">
            <StarsBackground
              starDensity={0.0015}
              className="[mask-image:radial-gradient(circle_at_center,white,transparent_85%)]"
            />
            <ShootingStars
              starColor="#f97316"
              trailColor="#f97316"
              minDelay={1000}
              maxDelay={3000}
              starHeight={4}
              starWidth={30}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black/80 pointer-events-none" />
          </div>
          <div className="relative z-10 min-h-screen flex flex-col">
            {children}
            <Analytics />
          </div>
        </LanguageProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'MiDika',
              legalName: 'MIDIKA SRL',
              url: 'https://midika.it/',
              logo: 'https://midika.it/logo.png',
              description:
                'Italian software house focused on minimalism and design.',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Via Giovanni Boccaccio 37',
                addressLocality: 'Milano',
                postalCode: '20123',
                addressCountry: 'IT',
              },
              telephone: '+39 351 989 6805',
              email: 'info@midika.it',
              vatID: 'IT12042860960',
              founder: [
                {
                  '@type': 'Person',
                  name: 'Nicholas Sollazzo',
                  jobTitle: 'CEO & Co-Founder',
                },
                {
                  '@type': 'Person',
                  name: 'Martire Baldassarre',
                  jobTitle: 'CFO & Co-Founder',
                },
                {
                  '@type': 'Person',
                  name: 'Domenico Magaretti',
                  jobTitle: 'CSO & Co-Founder',
                },
              ],
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

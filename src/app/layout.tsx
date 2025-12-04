import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import { StarsBackground } from '@/components/ui/stars-background';
import { ShootingStars } from '@/components/ui/shooting-stars';
import { LanguageProvider } from '@/lib/language-context';
import { ConsentProvider } from '@/components/consent/consent-provider';
import { ConsentBanner } from '@/components/consent/consent-banner';
import { ConsentGuard } from '@/components/consent/consent-guard';
import './globals.css';

const siteConfig = {
  name: 'MiDika',
  title: 'MiDika — Italian software house',
  description:
    'Italian software house focused on minimalism and design. We build clean, efficient, and maintainable software solutions.',
  url: 'https://midika.it',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'software house',
    'web development',
    'app development',
    'Italy',
    'Milan',
    'minimalist design',
    'custom software',
  ],
  authors: [
    { name: 'Nicholas Sollazzo' },
    { name: 'Martire Baldassarre' },
    { name: 'Domenico Magaretti' },
  ],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
      'it-IT': '/it',
    },
  },
  openGraph: {
    type: 'website',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@midaboratory',
    creator: '@midaboratory',
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // TODO: Add verification tokens when available
  // verification: {
  //   google: 'google-site-verification-token',
  // },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#000000' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`${GeistSans.className} antialiased bg-black text-white`}
        suppressHydrationWarning
      >
        <ConsentProvider>
          <LanguageProvider>
            <div className="fixed inset-0 z-0 pointer-events-none">
              <StarsBackground className="mask-[radial-gradient(circle_at_center,white,transparent_85%)]" />
              <ShootingStars
                starColor="#f97316"
                trailColor="#f97316"
                minDelay={1000}
                maxDelay={3000}
                starHeight={4}
                starWidth={30}
              />
              <div className="absolute inset-0 bg-linear-to-b from-black via-transparent to-black/80 pointer-events-none" />
            </div>
            <div className="relative z-10 min-h-screen flex flex-col">
              {children}
              <ConsentGuard>
                <Analytics />
              </ConsentGuard>
            </div>
            <ConsentBanner />
          </LanguageProvider>
        </ConsentProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'MiDika',
              legalName: 'MIDIKA SRL',
              url: 'https://midika.it/',
              logo: 'https://midika.it/icon.svg',
              description:
                'Italian software house focused on minimalism and design.',
              foundingDate: '2021-10-07',
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

import { NextRequest, NextResponse } from 'next/server';
import { trackPageView } from '@/lib/analytics';

/**
 * Next.js 16 Proxy - Server-side analytics tracking
 * Applies KISS principle: simple request interception
 * Applies DRY principle: reuses trackPageView function
 * Applies YAGNI principle: only tracks essential data
 *
 * GDPR Compliant:
 * - No IP addresses stored (uses Vercel's geo headers)
 * - No cookies set
 * - Aggregate data only
 */
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const country = request.headers.get('x-vercel-ip-country') || 'unknown';
  const referrer = request.headers.get('referer') || '';

  // Fire-and-forget tracking (don't block the response)
  // Track asynchronously without awaiting
  trackPageView({ path, country, referrer }).catch(() => {
    // Silently fail - analytics should never break the app
  });

  return NextResponse.next();
}

/**
 * Matcher configuration - only track actual page views
 * Excludes:
 * - API routes (/api/*)
 * - Static files (_next/static/*, _next/image/*)
 * - Icons (favicon.ico, icon.svg)
 * - Prefetch requests (next-router-prefetch header)
 */
export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};

import { NextRequest, NextResponse } from 'next/server';
import { trackPageView } from '@/lib/analytics';

/**
 * Detect bot from user agent string
 * Returns bot name if detected, undefined otherwise
 * Applies KISS principle: simple pattern matching
 */
function detectBot(userAgent: string): string | undefined {
  if (!userAgent) return undefined;

  const ua = userAgent.toLowerCase();

  // Common bot patterns
  const botPatterns: Record<string, RegExp> = {
    Googlebot: /googlebot/i,
    Bingbot: /bingbot|msnbot/i,
    GPTBot: /gptbot/i,
    ClaudeBot: /claude/i,
    Applebot: /applebot/i,
    DuckDuckBot: /duckduckbot/i,
    YandexBot: /yandexbot/i,
    Slurp: /slurp/i,
    facebookexternalhit: /facebookexternalhit/i,
    Twitterbot: /twitterbot/i,
    LinkedInBot: /linkedinbot/i,
    WhatsApp: /whatsapp/i,
    TelegramBot: /telegrambot/i,
    Baiduspider: /baiduspider/i,
    Sogou: /sogou/i,
  };

  for (const [botName, pattern] of Object.entries(botPatterns)) {
    if (pattern.test(ua)) {
      return botName;
    }
  }

  return undefined;
}

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
export default async function proxy(request: NextRequest) {
  // Skip tracking in development (localhost)
  const host = request.headers.get('host') || '';
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return NextResponse.next();
  }

  const path = request.nextUrl.pathname;
  const country = request.headers.get('x-vercel-ip-country') || 'unknown';
  const rawReferrer = request.headers.get('referer') || '';
  const userAgent = request.headers.get('user-agent') || '';
  const botName = detectBot(userAgent);

  // Filter out self-referrals (KISS: simple domain comparison)
  let referrer = '';
  if (rawReferrer) {
    try {
      const refUrl = new URL(rawReferrer);
      const refHost = refUrl.hostname.replace(/^www\./, '');
      const currentHost = host.replace(/^www\./, '');
      // Only count external referrers
      if (refHost !== currentHost) {
        referrer = rawReferrer;
      }
    } catch {
      // Invalid URL, skip referrer
    }
  }

  // Fire-and-forget tracking (don't block the response)
  trackPageView({ path, country, referrer, botName }).catch(() => {});

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

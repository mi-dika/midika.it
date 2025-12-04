import { kv } from '@vercel/kv';
import { env } from '@/env';
import { format } from 'date-fns';

export interface PageViewData {
  path: string;
  country: string;
  referrer?: string;
  botName?: string;
}

export interface PageViewStats {
  totalViews: number;
  byCountry: Record<string, number>;
  byPath?: Record<string, number>;
  botViews: number;
  byBot: Record<string, number>;
  byDate?: Record<string, number>;
  byReferrer?: Record<string, number>;
}

export interface GetPageViewsOptions {
  path?: string;
  days?: number;
}

/**
 * Generate a Redis key for a pageview entry
 * Format: pv:YYYY-MM-DD-HH:path:country
 * Example: pv:2024-12-04-14:/about:IT
 * Applies KISS principle: hour-level granularity for time tracking
 */
export function generateDateKey(path: string, country: string): string {
  const now = new Date();
  const date = format(now, 'yyyy-MM-dd');
  const hour = format(now, 'HH');
  return `pv:${date}-${hour}:${path}:${country}`;
}

/**
 * Generate a Redis key for bot tracking
 * Format: bot:YYYY-MM-DD-HH:botName
 * Example: bot:2024-12-04-14:Googlebot
 */
export function generateBotKey(botName: string): string {
  const now = new Date();
  const date = format(now, 'yyyy-MM-dd');
  const hour = format(now, 'HH');
  return `bot:${date}-${hour}:${botName}`;
}

/**
 * Generate a Redis key for referrer tracking
 * Format: ref:YYYY-MM-DD-HH:domain
 * Example: ref:2024-12-04-14:example.com
 */
export function generateReferrerKey(domain: string): string {
  const now = new Date();
  const date = format(now, 'yyyy-MM-dd');
  const hour = format(now, 'HH');
  return `ref:${date}-${hour}:${domain}`;
}

/**
 * Track a pageview (fire-and-forget, doesn't block)
 * Applies KISS principle: simple increment operation
 * Applies DRY principle: single function for all tracking
 * Applies YAGNI principle: only tracks essential data
 */
export async function trackPageView(data: PageViewData): Promise<void> {
  // Skip if KV is not configured
  if (!env.KV_REST_API_URL || !env.KV_REST_API_TOKEN) {
    return;
  }

  try {
    const key = generateDateKey(data.path, data.country);
    await kv.incr(key);

    // Track bot separately if detected
    if (data.botName) {
      const botKey = generateBotKey(data.botName);
      await kv.incr(botKey);
    }

    // Track referrer if provided
    if (data.referrer) {
      try {
        const url = new URL(data.referrer);
        const domain = url.hostname.replace(/^www\./, '');
        if (domain && domain !== 'unknown') {
          const refKey = generateReferrerKey(domain);
          await kv.incr(refKey);
        }
      } catch {
        // Invalid referrer URL, skip
      }
    }
  } catch {
    // Fail silently - analytics should never break the app
  }
}

/**
 * Get aggregated pageview statistics
 * Applies KISS principle: simple aggregation logic
 */
export async function getPageViews(
  options: GetPageViewsOptions = {}
): Promise<PageViewStats> {
  // Skip if KV is not configured
  if (!env.KV_REST_API_URL || !env.KV_REST_API_TOKEN) {
    return {
      totalViews: 0,
      byCountry: {},
      botViews: 0,
      byBot: {},
    };
  }

  try {
    // Build key pattern
    const keyPattern = options.path ? `pv:*:${options.path}:*` : 'pv:*';

    // Get all matching keys
    const keys = await kv.keys(keyPattern);

    if (keys.length === 0) {
      return {
        totalViews: 0,
        byCountry: {},
        botViews: 0,
        byBot: {},
      };
    }

    // Filter by date range if specified
    let filteredKeys = keys as string[];
    if (options.days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - options.days);
      cutoffDate.setHours(0, 0, 0, 0); // Start of cutoff day
      const cutoffStr = format(cutoffDate, 'yyyy-MM-dd');

      filteredKeys = keys.filter((key) => {
        // Extract date from key: pv:YYYY-MM-DD-HH:path:country
        const match = key.match(/^pv:(\d{4}-\d{2}-\d{2})-\d{2}:/);
        if (!match) return false;
        // Only include dates strictly after cutoff (not including cutoff day)
        return match[1] > cutoffStr;
      });
    }

    if (filteredKeys.length === 0) {
      return {
        totalViews: 0,
        byCountry: {},
        botViews: 0,
        byBot: {},
      };
    }

    // Get all values at once
    const values = await kv.mget(...filteredKeys);
    const counts = values.map((v) => (typeof v === 'number' ? v : 0));

    // Aggregate by country, path, and date
    const byCountry: Record<string, number> = {};
    const byPath: Record<string, number> = {};
    const byDate: Record<string, number> = {};
    let totalViews = 0;

    filteredKeys.forEach((key, index) => {
      const count = counts[index];
      totalViews += count;

      // Extract date (without hour), path, and country from key: pv:YYYY-MM-DD-HH:path:country
      const match = key.match(/^pv:(\d{4}-\d{2}-\d{2})-\d{2}:([^:]+):(.+)$/);
      if (match) {
        const [, date, path, country] = match;
        byCountry[country] = (byCountry[country] || 0) + count;
        byPath[path] = (byPath[path] || 0) + count;
        byDate[date] = (byDate[date] || 0) + count;
      }
    });

    // Get bot statistics
    const botStats = await getBotStats(options.days);

    // Get referrer statistics
    const referrerStats = await getReferrerStats(options.days);

    return {
      totalViews,
      byCountry,
      byPath,
      byDate,
      botViews: botStats.botViews,
      byBot: botStats.byBot,
      byReferrer: referrerStats.byReferrer,
    };
  } catch {
    // Fail gracefully - return empty stats
    return {
      totalViews: 0,
      byCountry: {},
      botViews: 0,
      byBot: {},
    };
  }
}

/**
 * Get bot statistics
 * Applies KISS principle: simple aggregation logic
 */
export async function getBotStats(days?: number): Promise<{
  botViews: number;
  byBot: Record<string, number>;
}> {
  // Skip if KV is not configured
  if (!env.KV_REST_API_URL || !env.KV_REST_API_TOKEN) {
    return { botViews: 0, byBot: {} };
  }

  try {
    const keys = await kv.keys('bot:*');

    if (keys.length === 0) {
      return { botViews: 0, byBot: {} };
    }

    // Filter by date range if specified
    let filteredKeys = keys as string[];
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      cutoffDate.setHours(0, 0, 0, 0);
      const cutoffStr = format(cutoffDate, 'yyyy-MM-dd');

      filteredKeys = keys.filter((key) => {
        // Extract date from key: bot:YYYY-MM-DD-HH:botName
        const match = key.match(/^bot:(\d{4}-\d{2}-\d{2})-\d{2}:/);
        if (!match) return false;
        return match[1] > cutoffStr;
      });
    }

    if (filteredKeys.length === 0) {
      return { botViews: 0, byBot: {} };
    }

    const values = await kv.mget(...filteredKeys);
    const counts = values.map((v) => (typeof v === 'number' ? v : 0));

    const byBot: Record<string, number> = {};
    let botViews = 0;

    filteredKeys.forEach((key, index) => {
      const count = counts[index];
      botViews += count;

      // Extract bot name from key: bot:YYYY-MM-DD-HH:botName
      const match = key.match(/^bot:\d{4}-\d{2}-\d{2}-\d{2}:(.+)$/);
      if (match) {
        const botName = match[1];
        byBot[botName] = (byBot[botName] || 0) + count;
      }
    });

    return { botViews, byBot };
  } catch {
    return { botViews: 0, byBot: {} };
  }
}

/**
 * Get referrer statistics
 * Applies KISS principle: simple aggregation logic
 */
export async function getReferrerStats(days?: number): Promise<{
  byReferrer: Record<string, number>;
}> {
  // Skip if KV is not configured
  if (!env.KV_REST_API_URL || !env.KV_REST_API_TOKEN) {
    return { byReferrer: {} };
  }

  try {
    const keys = await kv.keys('ref:*');

    if (keys.length === 0) {
      return { byReferrer: {} };
    }

    // Filter by date range if specified
    let filteredKeys = keys as string[];
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      cutoffDate.setHours(0, 0, 0, 0);
      const cutoffStr = format(cutoffDate, 'yyyy-MM-dd');

      filteredKeys = keys.filter((key) => {
        // Extract date from key: ref:YYYY-MM-DD-HH:domain
        const match = key.match(/^ref:(\d{4}-\d{2}-\d{2})-\d{2}:/);
        if (!match) return false;
        return match[1] > cutoffStr;
      });
    }

    if (filteredKeys.length === 0) {
      return { byReferrer: {} };
    }

    const values = await kv.mget(...filteredKeys);
    const counts = values.map((v) => (typeof v === 'number' ? v : 0));

    const byReferrer: Record<string, number> = {};

    filteredKeys.forEach((key, index) => {
      const count = counts[index];

      // Extract domain from key: ref:YYYY-MM-DD-HH:domain
      const match = key.match(/^ref:\d{4}-\d{2}-\d{2}-\d{2}:(.+)$/);
      if (match) {
        const domain = match[1];
        byReferrer[domain] = (byReferrer[domain] || 0) + count;
      }
    });

    return { byReferrer };
  } catch {
    return { byReferrer: {} };
  }
}

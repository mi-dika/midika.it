import { kv } from '@vercel/kv';
import { env } from '@/env';
import { format } from 'date-fns';

export interface PageViewData {
  path: string;
  country: string;
  referrer?: string;
}

export interface PageViewStats {
  totalViews: number;
  byCountry: Record<string, number>;
  byPath?: Record<string, number>;
}

export interface GetPageViewsOptions {
  path?: string;
  days?: number;
}

/**
 * Generate a Redis key for a pageview entry
 * Format: pv:YYYY-MM-DD:path:country
 * Example: pv:2024-12-04:/about:IT
 */
export function generateDateKey(path: string, country: string): string {
  const date = format(new Date(), 'yyyy-MM-dd');
  return `pv:${date}:${path}:${country}`;
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
    return { totalViews: 0, byCountry: {} };
  }

  try {
    // Build key pattern
    const keyPattern = options.path ? `pv:*:${options.path}:*` : 'pv:*';

    // Get all matching keys
    const keys = await kv.keys(keyPattern);

    if (keys.length === 0) {
      return { totalViews: 0, byCountry: {} };
    }

    // Filter by date range if specified
    let filteredKeys = keys as string[];
    if (options.days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - options.days);
      cutoffDate.setHours(0, 0, 0, 0); // Start of cutoff day
      const cutoffStr = format(cutoffDate, 'yyyy-MM-dd');

      filteredKeys = keys.filter((key) => {
        // Extract date from key: pv:YYYY-MM-DD:path:country
        const match = key.match(/^pv:(\d{4}-\d{2}-\d{2}):/);
        if (!match) return false;
        // Only include dates strictly after cutoff (not including cutoff day)
        return match[1] > cutoffStr;
      });
    }

    if (filteredKeys.length === 0) {
      return { totalViews: 0, byCountry: {} };
    }

    // Get all values at once
    const values = await kv.mget(...filteredKeys);
    const counts = values.map((v) => (typeof v === 'number' ? v : 0));

    // Aggregate by country
    const byCountry: Record<string, number> = {};
    let totalViews = 0;

    filteredKeys.forEach((key, index) => {
      const count = counts[index];
      totalViews += count;

      // Extract country from key: pv:date:path:country
      const match = key.match(/^pv:\d{4}-\d{2}-\d{2}:[^:]+:(.+)$/);
      if (match) {
        const country = match[1];
        byCountry[country] = (byCountry[country] || 0) + count;
      }
    });

    return { totalViews, byCountry };
  } catch {
    // Fail gracefully - return empty stats
    return { totalViews: 0, byCountry: {} };
  }
}

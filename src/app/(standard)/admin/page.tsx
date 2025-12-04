import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/analytics-auth';
import { getPageViews } from '@/lib/analytics';
import type { Metadata } from 'next';
import {
  LogOut,
  BarChart3,
  Globe,
  TrendingUp,
  Bot,
  FileText,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { ExportButton } from '@/components/admin/export-button';
import { TimeFilter } from '@/components/admin/time-filter';

/**
 * Convert ISO 3166-1 alpha-2 country code to flag emoji
 * KISS: Simple regional indicator conversion
 */
function countryToFlag(countryCode: string): string {
  if (countryCode === 'unknown' || countryCode.length !== 2) {
    return '🌍';
  }
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export const metadata: Metadata = {
  title: 'Analytics Dashboard',
  description: 'Website analytics dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

async function getAnalyticsData(days?: number) {
  try {
    const stats = await getPageViews({ days });
    return stats;
  } catch {
    return null;
  }
}

interface AnalyticsPageProps {
  searchParams: Promise<{ days?: string }>;
}

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken || !verifySession(sessionToken)) {
    redirect('/admin/login');
  }

  const params = await searchParams;
  const days = params.days ? parseInt(params.days, 10) : undefined;
  const analyticsData = await getAnalyticsData(days);

  if (!analyticsData) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
          Failed to load analytics data. Please try again.
        </div>
      </main>
    );
  }

  const topCountries = Object.entries(analyticsData.byCountry || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10);

  const topBots = Object.entries(analyticsData.byBot || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10);

  const topPages = Object.entries(analyticsData.byPath || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10);

  const topReferrers = Object.entries(analyticsData.byReferrer || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10);

  const trendData = Object.entries(analyticsData.byDate || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30); // Last 30 days

  const maxTrendValue = Math.max(...trendData.map(([, views]) => views), 1);

  const botPercentage =
    analyticsData.totalViews > 0
      ? ((analyticsData.botViews / analyticsData.totalViews) * 100).toFixed(1)
      : '0';

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-white">Analytics</h1>
          <p className="text-white/60">
            Website traffic and visitor statistics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TimeFilter currentDays={days} />
          <ExportButton stats={analyticsData} />
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2 text-white/60">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm font-medium">Total Views</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {analyticsData.totalViews.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2 text-white/60">
            <Globe className="h-5 w-5" />
            <span className="text-sm font-medium">Countries</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {Object.keys(analyticsData.byCountry || {}).length}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2 text-white/60">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-medium">Top Country</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {topCountries[0]
              ? `${countryToFlag(topCountries[0][0])} ${topCountries[0][0]}`
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Bot Traffic Card */}
      {analyticsData.botViews > 0 && (
        <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Bot Traffic</h2>
            <div className="text-sm text-white/60">
              {analyticsData.botViews.toLocaleString()} views ({botPercentage}%)
            </div>
          </div>
          {topBots.length > 0 ? (
            <div className="space-y-3">
              {topBots.map(([bot, views]) => {
                const viewCount =
                  typeof views === 'number' ? views : parseInt(views, 10) || 0;
                const percentage =
                  analyticsData.botViews > 0
                    ? (viewCount / analyticsData.botViews) * 100
                    : 0;
                return (
                  <div
                    key={bot}
                    className="relative flex items-center justify-between overflow-hidden rounded-lg border border-white/5 bg-white/5 px-4 py-3"
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-orange-500/20"
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="relative z-10 flex items-center gap-3 font-medium text-white">
                      <Bot className="h-5 w-5" />
                      {bot}
                    </span>
                    <span className="relative z-10 text-white/60">
                      {viewCount.toLocaleString()} views
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-white/60">No bot traffic detected.</p>
          )}
        </div>
      )}

      {/* Top Countries */}
      <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
        <h2 className="mb-6 text-xl font-semibold text-white">Top Countries</h2>
        {topCountries.length > 0 ? (
          <div className="space-y-3">
            {topCountries.map(([country, views]) => {
              const viewCount =
                typeof views === 'number' ? views : parseInt(views, 10) || 0;
              const percentage =
                analyticsData.totalViews > 0
                  ? (viewCount / analyticsData.totalViews) * 100
                  : 0;
              return (
                <div
                  key={country}
                  className="relative flex items-center justify-between overflow-hidden rounded-lg border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-orange-500/20"
                    style={{ width: `${percentage}%` }}
                  />
                  <span className="relative z-10 flex items-center gap-3 font-medium text-white">
                    <span className="text-2xl">{countryToFlag(country)}</span>
                    {country}
                  </span>
                  <span className="relative z-10 text-white/60">
                    {viewCount.toLocaleString()} views
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-white/60">No data available yet.</p>
        )}
      </div>

      {/* Top Pages */}
      {topPages.length > 0 && (
        <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
          <h2 className="mb-6 text-xl font-semibold text-white">Top Pages</h2>
          <div className="space-y-3">
            {topPages.map(([path, views]) => {
              const viewCount =
                typeof views === 'number' ? views : parseInt(views, 10) || 0;
              const percentage =
                analyticsData.totalViews > 0
                  ? (viewCount / analyticsData.totalViews) * 100
                  : 0;
              return (
                <div
                  key={path}
                  className="relative flex items-center justify-between overflow-hidden rounded-lg border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-orange-500/20"
                    style={{ width: `${percentage}%` }}
                  />
                  <span className="relative z-10 flex items-center gap-3 font-medium text-white">
                    <FileText className="h-5 w-5" />
                    {path}
                  </span>
                  <span className="relative z-10 text-white/60">
                    {viewCount.toLocaleString()} views
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Traffic Sources */}
      {topReferrers.length > 0 && (
        <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Traffic Sources
          </h2>
          <div className="space-y-3">
            {topReferrers.map(([referrer, views]) => {
              const viewCount =
                typeof views === 'number' ? views : parseInt(views, 10) || 0;
              const percentage =
                analyticsData.totalViews > 0
                  ? (viewCount / analyticsData.totalViews) * 100
                  : 0;
              return (
                <div
                  key={referrer}
                  className="relative flex items-center justify-between overflow-hidden rounded-lg border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-orange-500/20"
                    style={{ width: `${percentage}%` }}
                  />
                  <span className="relative z-10 flex items-center gap-3 font-medium text-white">
                    <ExternalLink className="h-5 w-5" />
                    {referrer}
                  </span>
                  <span className="relative z-10 text-white/60">
                    {viewCount.toLocaleString()} views
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trend Chart */}
      {trendData.length > 0 && (
        <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Daily Trends</h2>
            <Calendar className="h-5 w-5 text-white/60" />
          </div>
          <div className="space-y-2">
            {trendData.map(([date, views]) => {
              const viewCount =
                typeof views === 'number' ? views : parseInt(views, 10) || 0;
              const barWidth = (viewCount / maxTrendValue) * 100;
              return (
                <div key={date} className="flex items-center gap-4">
                  <span className="w-24 text-sm text-white/60">{date}</span>
                  <div className="flex-1">
                    <div className="relative h-6 overflow-hidden rounded bg-white/5">
                      <div
                        className="h-full bg-orange-500/30"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-20 text-right text-sm text-white/60">
                    {viewCount.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/analytics-auth';
import { getPageViews } from '@/lib/analytics';
import type { Metadata } from 'next';
import { LogOut, BarChart3, Globe, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Analytics Dashboard',
  description: 'Website analytics dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

async function getAnalyticsData() {
  try {
    const stats = await getPageViews();
    return {
      totalViews: stats.totalViews,
      byCountry: stats.byCountry,
    };
  } catch {
    return null;
  }
}

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken || !verifySession(sessionToken)) {
    redirect('/admin/login');
  }

  const analyticsData = await getAnalyticsData();

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

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-white">Analytics</h1>
          <p className="text-white/60">
            Website traffic and visitor statistics
          </p>
        </div>
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
            {topCountries[0]?.[0] || 'N/A'}
          </p>
        </div>
      </div>

      {/* Top Countries */}
      <div className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
        <h2 className="mb-6 text-xl font-semibold text-white">Top Countries</h2>
        {topCountries.length > 0 ? (
          <div className="space-y-3">
            {topCountries.map(([country, views]) => (
              <div
                key={country}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3"
              >
                <span className="font-medium text-white">{country}</span>
                <span className="text-white/60">
                  {typeof views === 'number' ? views.toLocaleString() : views}{' '}
                  views
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/60">No data available yet.</p>
        )}
      </div>
    </main>
  );
}

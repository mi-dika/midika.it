'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  Bot,
  Calendar,
  Cpu,
  ExternalLink,
  FileText,
  Globe,
  Laptop,
  LogOut,
  Monitor,
  Smartphone,
  Tablet,
  TrendingUp,
} from 'lucide-react';
import type { PageViewStats } from '@/lib/analytics';
import { ExportButton } from '@/components/admin/export-button';
import { TimeFilter } from '@/components/admin/time-filter';

interface AdminDashboardProps {
  initialData: PageViewStats;
  days?: number;
}

interface AdminApiResponse {
  success: boolean;
  data?: PageViewStats;
}

const REFRESH_INTERVAL_MS = 15000;

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

export function AdminDashboard({ initialData, days }: AdminDashboardProps) {
  const [stats, setStats] = useState<PageViewStats>(initialData);

  useEffect(() => {
    setStats(initialData);
  }, [initialData]);

  useEffect(() => {
    let active = true;
    let isFetching = false;

    const fetchLatest = async () => {
      if (isFetching) return;
      isFetching = true;

      try {
        const query = days ? `?days=${days}` : '';
        const response = await fetch(`/api/admin${query}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as AdminApiResponse;

        if (!payload.success || !payload.data || !active) {
          return;
        }

        setStats(payload.data);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(error);
        }
      } finally {
        isFetching = false;
      }
    };

    fetchLatest();
    const intervalId = window.setInterval(fetchLatest, REFRESH_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [days]);

  const topCountries = Object.entries(stats.byCountry || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10);

  const topBots = Object.entries(stats.byBot || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10);

  const topPages = Object.entries(stats.byPath || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10);

  const topReferrers = Object.entries(stats.byReferrer || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10);

  const topBrowsers = Object.entries(stats.byBrowser || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10);

  const topOS = Object.entries(stats.byOS || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10);

  const topDevices = Object.entries(stats.byDevice || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10);

  const trendData = Object.entries(stats.byDate || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30); // Last 30 days

  const maxTrendValue = Math.max(...trendData.map(([, views]) => views), 1);

  const botPercentage =
    stats.totalViews > 0
      ? ((stats.botViews / stats.totalViews) * 100).toFixed(1)
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
          <ExportButton stats={stats} />
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

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2 text-white/60">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm font-medium">Total Views</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {stats.totalViews.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2 text-white/60">
            <Globe className="h-5 w-5" />
            <span className="text-sm font-medium">Countries</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {Object.keys(stats.byCountry || {}).length}
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

      {stats.botViews > 0 && (
        <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Bot Traffic</h2>
            <div className="text-sm text-white/60">
              {stats.botViews.toLocaleString()} views ({botPercentage}%)
            </div>
          </div>
          {topBots.length > 0 ? (
            <div className="space-y-3">
              {topBots.map(([bot, views]) => {
                const viewCount =
                  typeof views === 'number' ? views : parseInt(views, 10) || 0;
                const percentage =
                  stats.botViews > 0 ? (viewCount / stats.botViews) * 100 : 0;
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

      <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
        <h2 className="mb-6 text-xl font-semibold text-white">Top Countries</h2>
        {topCountries.length > 0 ? (
          <div className="space-y-3">
            {topCountries.map(([country, views]) => {
              const viewCount =
                typeof views === 'number' ? views : parseInt(views, 10) || 0;
              const percentage =
                stats.totalViews > 0 ? (viewCount / stats.totalViews) * 100 : 0;
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

      {topPages.length > 0 && (
        <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
          <h2 className="mb-6 text-xl font-semibold text-white">Top Pages</h2>
          <div className="space-y-3">
            {topPages.map(([path, views]) => {
              const viewCount =
                typeof views === 'number' ? views : parseInt(views, 10) || 0;
              const percentage =
                stats.totalViews > 0 ? (viewCount / stats.totalViews) * 100 : 0;
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
                stats.totalViews > 0 ? (viewCount / stats.totalViews) * 100 : 0;
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

      {topBrowsers.length > 0 && (
        <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Top Browsers
          </h2>
          <div className="space-y-3">
            {topBrowsers.map(([browser, views]) => {
              const viewCount =
                typeof views === 'number' ? views : parseInt(views, 10) || 0;
              const percentage =
                stats.totalViews > 0 ? (viewCount / stats.totalViews) * 100 : 0;
              return (
                <div
                  key={browser}
                  className="relative flex items-center justify-between overflow-hidden rounded-lg border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-orange-500/20"
                    style={{ width: `${percentage}%` }}
                  />
                  <span className="relative z-10 flex items-center gap-3 font-medium text-white">
                    <Monitor className="h-5 w-5" />
                    {browser}
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

      {topOS.length > 0 && (
        <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Top Operating Systems
          </h2>
          <div className="space-y-3">
            {topOS.map(([os, views]) => {
              const viewCount =
                typeof views === 'number' ? views : parseInt(views, 10) || 0;
              const percentage =
                stats.totalViews > 0 ? (viewCount / stats.totalViews) * 100 : 0;
              return (
                <div
                  key={os}
                  className="relative flex items-center justify-between overflow-hidden rounded-lg border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-orange-500/20"
                    style={{ width: `${percentage}%` }}
                  />
                  <span className="relative z-10 flex items-center gap-3 font-medium text-white">
                    <Cpu className="h-5 w-5" />
                    {os}
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

      {topDevices.length > 0 && (
        <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Device Types
          </h2>
          <div className="space-y-3">
            {topDevices.map(([device, views]) => {
              const viewCount =
                typeof views === 'number' ? views : parseInt(views, 10) || 0;
              const percentage =
                stats.totalViews > 0 ? (viewCount / stats.totalViews) * 100 : 0;

              let Icon = Monitor;
              if (device === 'mobile') Icon = Smartphone;
              if (device === 'tablet') Icon = Tablet;
              if (device === 'desktop') Icon = Laptop;

              return (
                <div
                  key={device}
                  className="relative flex items-center justify-between overflow-hidden rounded-lg border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-orange-500/20"
                    style={{ width: `${percentage}%` }}
                  />
                  <span className="relative z-10 flex items-center gap-3 font-medium text-white">
                    <Icon className="h-5 w-5" />
                    <span className="capitalize">{device}</span>
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

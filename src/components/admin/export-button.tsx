'use client';

import { Download } from 'lucide-react';
import type { PageViewStats } from '@/lib/analytics';

interface ExportButtonProps {
  stats: PageViewStats;
}

/**
 * Export analytics data as CSV
 * Applies KISS principle: simple client-side CSV generation
 */
export function ExportButton({ stats }: ExportButtonProps) {
  const handleExport = () => {
    const rows: string[] = [];

    // Header
    rows.push('Metric,Value');

    // Total views
    rows.push(`Total Views,${stats.totalViews}`);

    // Countries
    rows.push('\nCountry,Views');
    Object.entries(stats.byCountry || {})
      .sort(([, a], [, b]) => b - a)
      .forEach(([country, views]) => {
        rows.push(`${country},${views}`);
      });

    // Bots
    if (stats.byBot && Object.keys(stats.byBot).length > 0) {
      rows.push('\nBot,Views');
      Object.entries(stats.byBot)
        .sort(([, a], [, b]) => b - a)
        .forEach(([bot, views]) => {
          rows.push(`${bot},${views}`);
        });
    }

    // Pages
    if (stats.byPath && Object.keys(stats.byPath).length > 0) {
      rows.push('\nPage,Views');
      Object.entries(stats.byPath)
        .sort(([, a], [, b]) => b - a)
        .forEach(([path, views]) => {
          rows.push(`${path},${views}`);
        });
    }

    // Referrers
    if (stats.byReferrer && Object.keys(stats.byReferrer).length > 0) {
      rows.push('\nReferrer,Views');
      Object.entries(stats.byReferrer)
        .sort(([, a], [, b]) => b - a)
        .forEach(([referrer, views]) => {
          rows.push(`${referrer},${views}`);
        });
    }

    // Dates
    if (stats.byDate && Object.keys(stats.byDate).length > 0) {
      rows.push('\nDate,Views');
      Object.entries(stats.byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([date, views]) => {
          rows.push(`${date},${views}`);
        });
    }

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </button>
  );
}

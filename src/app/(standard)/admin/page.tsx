import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/analytics-auth';
import { getPageViews } from '@/lib/analytics';
import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/admin/dashboard-client';

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

  return <AdminDashboard initialData={analyticsData} days={days} />;
}

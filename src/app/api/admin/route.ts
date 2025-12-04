import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPageViews } from '@/lib/analytics';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/analytics-auth';

/**
 * Helper to check if user is authenticated
 * Applies DRY principle: reusable auth check
 */
async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return sessionToken ? verifySession(sessionToken) : false;
}

/**
 * GET /api/admin
 * Returns aggregated analytics data
 * Protected endpoint - requires authentication
 * Applies KISS principle: simple GET endpoint
 * Applies DRY principle: reuses getPageViews function
 */
export async function GET(request: Request) {
  // Check authentication
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || undefined;
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : undefined;

    const stats = await getPageViews({ path, days });

    return NextResponse.json({
      success: true,
      data: {
        totalViews: stats.totalViews,
        byCountry: stats.byCountry,
        // Add top pages if no specific path requested
        ...(path === undefined && {
          topPages: [], // TODO: Implement if needed (YAGNI - not needed yet)
        }),
      },
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics',
      },
      { status: 500 }
    );
  }
}

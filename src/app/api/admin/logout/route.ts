import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { revokeSession, SESSION_COOKIE_NAME } from '@/lib/analytics-auth';

/**
 * POST /api/admin/logout
 * Revokes session and clears cookie
 * Supports both JSON API calls and form submissions
 * Applies KISS principle: simple logout
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      revokeSession(sessionToken);
    }

    // Check if this is a form submission (redirect) or API call (JSON)
    const headersList = await headers();
    const contentType = headersList.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const response = NextResponse.json({ success: true });
      // Clear cookie in response
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    // Form submission - redirect to login with cookie cleared
    const response = NextResponse.redirect(
      new URL(
        '/admin/login',
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      )
    );
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}

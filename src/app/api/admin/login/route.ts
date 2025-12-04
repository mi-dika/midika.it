import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  verifyPassword,
  createSession,
  SESSION_COOKIE_NAME,
} from '@/lib/analytics-auth';

/**
 * POST /api/admin/login
 * Authenticates user with password and creates session
 * Applies KISS principle: simple password check
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = createSession();

    // Create response with cookie set in headers
    const response = NextResponse.json({ success: true });

    // Set HTTP-only, Secure, SameSite cookie
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}

import { env } from '@/env';
import { createHmac, timingSafeEqual, randomUUID } from 'crypto';

export const SESSION_COOKIE_NAME = 'analytics_session';

// Session expiry time in milliseconds (7 days)
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Verify password against environment secret
 * Uses timing-safe comparison to prevent timing attacks
 * Applies KISS principle: simple password check
 */
export function verifyPassword(password: string): boolean {
  const secret = env.ADMIN_PASSWORD;
  if (!secret) {
    return false;
  }

  // Timing-safe comparison to prevent timing attacks
  const secretBuffer = Buffer.from(secret, 'utf8');
  const passwordBuffer = Buffer.from(password, 'utf8');

  if (secretBuffer.length !== passwordBuffer.length) {
    return false;
  }

  try {
    return timingSafeEqual(secretBuffer, passwordBuffer);
  } catch {
    return false;
  }
}

/**
 * Create a new session token
 * Uses HMAC for secure token generation
 * Token format: timestamp:random:signature
 * Applies DRY principle: reusable session creation
 */
export function createSession(): string {
  const timestamp = Date.now().toString();
  const random = randomUUID();
  const data = `${timestamp}:${random}`;

  // Sign the session token with HMAC
  const secret = env.ADMIN_PASSWORD || 'fallback-secret';
  const hmac = createHmac('sha256', secret);
  hmac.update(data);
  const signature = hmac.digest('base64url');

  return `${data}:${signature}`;
}

/**
 * Verify a session token
 * Validates HMAC signature and checks expiry
 * No in-memory state needed - survives server restarts
 * Applies KISS principle: simple stateless validation
 */
export function verifySession(sessionToken: string): boolean {
  if (!sessionToken) {
    return false;
  }

  // Verify signature
  const parts = sessionToken.split(':');
  if (parts.length !== 3) {
    return false;
  }

  const [timestamp, random, signature] = parts;

  // Check if session has expired
  const sessionTime = parseInt(timestamp, 10);
  if (isNaN(sessionTime) || Date.now() - sessionTime > SESSION_EXPIRY_MS) {
    return false;
  }

  const data = `${timestamp}:${random}`;
  const secret = env.ADMIN_PASSWORD || 'fallback-secret';

  const hmac = createHmac('sha256', secret);
  hmac.update(data);
  const expectedSignature = hmac.digest('base64url');

  // Timing-safe comparison
  try {
    const signatureBuffer = Buffer.from(signature, 'base64url');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64url');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Revoke a session token
 * With stateless sessions, we can't truly revoke - just clear the cookie
 * For true revocation, would need a blocklist in KV (YAGNI for now)
 */
export function revokeSession(_sessionToken: string): void {
  // Stateless sessions can't be revoked server-side
  // The cookie will be cleared client-side
}

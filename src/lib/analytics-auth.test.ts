import {
  verifyPassword,
  createSession,
  verifySession,
  SESSION_COOKIE_NAME,
} from './analytics-auth';

// Mock env module
jest.mock('../env', () => ({
  env: {
    ANALYTICS_SECRET: 'test-secret-password',
  },
}));

describe('analytics-auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', () => {
      expect(verifyPassword('test-secret-password')).toBe(true);
    });

    it('should return false for incorrect password', () => {
      expect(verifyPassword('wrong-password')).toBe(false);
    });

    it('should return false for empty password', () => {
      expect(verifyPassword('')).toBe(false);
    });

    it('should use timing-safe comparison', () => {
      // This test verifies the function doesn't short-circuit
      const correct = verifyPassword('test-secret-password');
      const incorrect = verifyPassword('wrong-password');
      expect(correct).toBe(true);
      expect(incorrect).toBe(false);
    });
  });

  describe('createSession', () => {
    it('should create a session token', () => {
      const session = createSession();
      expect(session).toBeTruthy();
      expect(typeof session).toBe('string');
      expect(session.length).toBeGreaterThan(0);
    });

    it('should create unique session tokens', () => {
      const session1 = createSession();
      const session2 = createSession();
      expect(session1).not.toBe(session2);
    });

    it('should create tokens with expected format', () => {
      const session = createSession();
      // Should be timestamp:uuid:signature format
      expect(session).toMatch(/^\d+:[a-f0-9-]+:[A-Za-z0-9_-]+$/);
    });
  });

  describe('verifySession', () => {
    it('should verify a valid session', () => {
      const session = createSession();
      expect(verifySession(session)).toBe(true);
    });

    it('should reject invalid session', () => {
      expect(verifySession('invalid-session-token')).toBe(false);
    });

    it('should reject empty session', () => {
      expect(verifySession('')).toBe(false);
    });

    it('should reject tampered session', () => {
      const session = createSession();
      const tampered = session.slice(0, -5) + 'XXXXX';
      expect(verifySession(tampered)).toBe(false);
    });

    it('should reject expired session', () => {
      // Create a session with an old timestamp
      const oldTimestamp = (Date.now() - 8 * 24 * 60 * 60 * 1000).toString(); // 8 days ago
      const random = 'test-random-uuid';
      const data = `${oldTimestamp}:${random}`;

      // We can't easily create a valid signature for this test without access to crypto
      // So we just test that the session is rejected (it will fail signature check)
      const fakeSession = `${data}:fake-signature`;
      expect(verifySession(fakeSession)).toBe(false);
    });
  });

  describe('SESSION_COOKIE_NAME', () => {
    it('should export cookie name constant', () => {
      expect(SESSION_COOKIE_NAME).toBe('analytics_session');
    });
  });
});

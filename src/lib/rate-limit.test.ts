import { RateLimiter } from './rate-limit';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  const config = {
    capacity: 10,
    fillRate: 1, // 1 token per second
  };

  beforeEach(() => {
    rateLimiter = new RateLimiter(config);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should allow requests within capacity', () => {
    const key = 'test-user';
    for (let i = 0; i < 10; i++) {
      expect(rateLimiter.check(key)).toBe(true);
    }
  });

  it('should block requests exceeding capacity', () => {
    const key = 'test-user';
    for (let i = 0; i < 10; i++) {
      rateLimiter.check(key);
    }
    expect(rateLimiter.check(key)).toBe(false);
  });

  it('should refill tokens over time', () => {
    const key = 'test-user';
    // Consume all tokens
    for (let i = 0; i < 10; i++) {
      rateLimiter.check(key);
    }
    expect(rateLimiter.check(key)).toBe(false);

    // Advance time by 1 second (should add 1 token)
    jest.advanceTimersByTime(1000);

    expect(rateLimiter.check(key)).toBe(true);
    expect(rateLimiter.check(key)).toBe(false);
  });

  it('should not exceed capacity when refilling', () => {
    const key = 'test-user';
    // Advance time by 100 seconds (should fill to capacity 10, not 100)
    jest.advanceTimersByTime(100000);

    for (let i = 0; i < 10; i++) {
      expect(rateLimiter.check(key)).toBe(true);
    }
    expect(rateLimiter.check(key)).toBe(false);
  });

  it('should track different keys independently', () => {
    const key1 = 'user1';
    const key2 = 'user2';

    // Consume all tokens for user1
    for (let i = 0; i < 10; i++) {
      rateLimiter.check(key1);
    }
    expect(rateLimiter.check(key1)).toBe(false);

    // User2 should still have tokens
    expect(rateLimiter.check(key2)).toBe(true);
  });
});

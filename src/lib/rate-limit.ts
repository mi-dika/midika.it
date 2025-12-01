export interface RateLimitConfig {
  capacity: number;
  fillRate: number; // tokens per second
}

interface Bucket {
  tokens: number;
  lastFilled: number;
}

export class RateLimiter {
  private buckets: Map<string, Bucket>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.buckets = new Map();
    this.config = config;
  }

  check(key: string): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = {
        tokens: this.config.capacity,
        lastFilled: now,
      };
      this.buckets.set(key, bucket);
    }

    // Refill bucket
    const timePassed = (now - bucket.lastFilled) / 1000;
    const tokensToAdd = timePassed * this.config.fillRate;
    bucket.tokens = Math.min(this.config.capacity, bucket.tokens + tokensToAdd);
    bucket.lastFilled = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }

    return false;
  }
}

// Default instance: 10 requests burst, refilling at 1 request per 10 seconds (6 per minute)
export const rateLimiter = new RateLimiter({
  capacity: 10,
  fillRate: 0.1,
});

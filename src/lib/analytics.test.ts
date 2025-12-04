// Mock env module first
jest.mock('../env', () => ({
  env: {
    KV_REST_API_URL: 'https://test-kv.vercel.app',
    KV_REST_API_TOKEN: 'test-token',
  },
}));

// Mock @vercel/kv
jest.mock('@vercel/kv', () => ({
  kv: {
    incr: jest.fn(),
    mget: jest.fn(),
    keys: jest.fn(),
  },
}));

import { trackPageView, getPageViews, generateDateKey } from './analytics';
import { kv } from '@vercel/kv';

const mockKv = kv as jest.Mocked<typeof kv>;

describe('analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-12-04T10:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('generateDateKey', () => {
    it('should generate correct date key format', () => {
      const key = generateDateKey('/about', 'IT');
      expect(key).toBe('pv:2024-12-04:/about:IT');
    });

    it('should handle unknown country', () => {
      const key = generateDateKey('/contact', 'unknown');
      expect(key).toBe('pv:2024-12-04:/contact:unknown');
    });

    it('should handle root path', () => {
      const key = generateDateKey('/', 'US');
      expect(key).toBe('pv:2024-12-04:/:US');
    });
  });

  describe('trackPageView', () => {
    it('should increment pageview counter', async () => {
      mockKv.incr.mockResolvedValue(1);

      await trackPageView({
        path: '/about',
        country: 'IT',
        referrer: 'https://google.com',
      });

      expect(mockKv.incr).toHaveBeenCalledWith('pv:2024-12-04:/about:IT');
    });

    it('should handle missing referrer', async () => {
      mockKv.incr.mockResolvedValue(1);

      await trackPageView({
        path: '/contact',
        country: 'US',
        referrer: '',
      });

      expect(mockKv.incr).toHaveBeenCalledWith('pv:2024-12-04:/contact:US');
    });

    it('should handle unknown country', async () => {
      mockKv.incr.mockResolvedValue(1);

      await trackPageView({
        path: '/',
        country: 'unknown',
        referrer: '',
      });

      expect(mockKv.incr).toHaveBeenCalledWith('pv:2024-12-04:/:unknown');
    });

    it('should not throw if KV is unavailable', async () => {
      mockKv.incr.mockRejectedValue(new Error('KV unavailable'));

      await expect(
        trackPageView({
          path: '/test',
          country: 'IT',
          referrer: '',
        })
      ).resolves.not.toThrow();
    });
  });

  describe('getPageViews', () => {
    it('should aggregate pageviews for a specific path', async () => {
      mockKv.keys.mockResolvedValue([
        'pv:2024-12-04:/about:IT',
        'pv:2024-12-04:/about:US',
        'pv:2024-12-03:/about:IT',
      ]);
      mockKv.mget.mockResolvedValue([5, 3, 2]);

      const result = await getPageViews({ path: '/about' });

      expect(mockKv.keys).toHaveBeenCalledWith('pv:*:/about:*');
      expect(result.totalViews).toBe(10);
      expect(result.byCountry).toEqual({ IT: 7, US: 3 });
    });

    it('should aggregate all pageviews when no path specified', async () => {
      mockKv.keys.mockResolvedValue([
        'pv:2024-12-04:/about:IT',
        'pv:2024-12-04:/contact:US',
        'pv:2024-12-03:/:IT',
      ]);
      mockKv.mget.mockResolvedValue([5, 3, 10]);

      const result = await getPageViews();

      expect(mockKv.keys).toHaveBeenCalledWith('pv:*');
      expect(result.totalViews).toBe(18);
    });

    it('should return zero when no data exists', async () => {
      mockKv.keys.mockResolvedValue([]);
      mockKv.mget.mockResolvedValue([]);

      const result = await getPageViews();

      expect(result.totalViews).toBe(0);
      expect(result.byCountry).toEqual({});
    });

    it('should handle time range filtering', async () => {
      mockKv.keys.mockResolvedValue([
        'pv:2024-12-04:/about:IT',
        'pv:2024-12-03:/about:IT',
        'pv:2024-12-02:/about:IT',
      ]);
      mockKv.mget.mockResolvedValue([5, 3, 2]);

      const result = await getPageViews({
        path: '/about',
        days: 2,
      });

      // Should only include last 2 days (2024-12-04 and 2024-12-03)
      expect(mockKv.keys).toHaveBeenCalledWith('pv:*:/about:*');
      expect(result.totalViews).toBe(8); // 5 + 3, excluding 2024-12-02
    });

    it('should not throw if KV is unavailable', async () => {
      mockKv.keys.mockRejectedValue(new Error('KV unavailable'));

      await expect(getPageViews()).resolves.not.toThrow();
    });
  });
});

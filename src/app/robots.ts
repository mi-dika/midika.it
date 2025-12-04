import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const host = 'https://midika.it';
  const allow = ['/'];
  const disallow = ['/admin'];
  return {
    rules: [
      { userAgent: '*', allow, disallow },
      { userAgent: 'GPTBot', allow, disallow },
      { userAgent: 'OAI-SearchBot', allow, disallow },
      { userAgent: 'CCBot', allow, disallow },
      { userAgent: 'ClaudeBot', allow, disallow },
      { userAgent: 'PerplexityBot', allow, disallow },
      { userAgent: 'Google-Extended', allow, disallow },
      { userAgent: 'Applebot-Extended', allow, disallow },
    ],
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}

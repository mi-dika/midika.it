import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const host = 'https://midika.it';
  const allow = ['/'];
  return {
    rules: [
      { userAgent: '*', allow },
      { userAgent: 'GPTBot', allow },
      { userAgent: 'OAI-SearchBot', allow },
      { userAgent: 'CCBot', allow },
      { userAgent: 'ClaudeBot', allow },
      { userAgent: 'PerplexityBot', allow },
      { userAgent: 'Google-Extended', allow },
      { userAgent: 'Applebot-Extended', allow },
    ],
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}

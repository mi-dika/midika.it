const IUBENDA_POLICY_IDS = {
  en: '44151989',
  it: '98410490',
} as const;

const BASE_URL = 'https://www.iubenda.com/api/privacy-policy';

type Language = keyof typeof IUBENDA_POLICY_IDS;

interface IubendaApiResponse {
  success: boolean;
  content: string;
}

/**
 * Fetches privacy policy content from Iubenda API
 * Uses Next.js fetch caching with 24h revalidation
 */
export async function fetchPrivacyPolicy(
  lang: Language = 'en'
): Promise<string> {
  const policyId = IUBENDA_POLICY_IDS[lang];
  const url = `${BASE_URL}/${policyId}`;

  const response = await fetch(url, {
    next: { revalidate: 86400 }, // Cache for 24 hours
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch privacy policy: ${response.statusText}`);
  }

  const data: IubendaApiResponse = await response.json();
  return data.content;
}

/**
 * Fetches cookie policy content from Iubenda API
 * Uses Next.js fetch caching with 24h revalidation
 */
export async function fetchCookiePolicy(
  lang: Language = 'en'
): Promise<string> {
  const policyId = IUBENDA_POLICY_IDS[lang];
  const url = `${BASE_URL}/${policyId}/cookie-policy`;

  const response = await fetch(url, {
    next: { revalidate: 86400 }, // Cache for 24 hours
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cookie policy: ${response.statusText}`);
  }

  const data: IubendaApiResponse = await response.json();
  return data.content;
}

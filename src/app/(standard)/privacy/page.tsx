import type { Metadata } from 'next';
import { fetchPrivacyPolicy } from '@/lib/iubenda';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy of MiDika - Italian software house focused on minimalism and design.',
  alternates: { canonical: '/privacy' },
};

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function PrivacyPage({ searchParams }: PageProps) {
  const { lang } = await searchParams;
  const language = lang === 'it' ? 'it' : 'en';

  let policyContent: string;

  try {
    policyContent = await fetchPrivacyPolicy(language);
  } catch (error) {
    console.error('Failed to fetch privacy policy:', error);
    policyContent =
      '<p>Unable to load privacy policy at this time. Please try again later.</p>';
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 text-white/90">
      <h1 className="mb-8 text-4xl font-bold tracking-tight text-white">
        Privacy Policy
      </h1>

      <div
        className="iubenda-policy"
        dangerouslySetInnerHTML={{ __html: policyContent }}
      />
    </main>
  );
}

'use client';

import { useLanguage } from '@/lib/language-context';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-white/10 py-6 bg-black/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
        <span className="text-xs text-white/40">
          © {new Date().getFullYear()} MiDika. {t('footerText')}{' '}
          <span className="text-primary">♥</span> in Italy.
        </span>
        <div className="flex gap-6 text-xs text-white/40">
          <a href="#" className="hover:text-white transition-colors">
            {t('privacy')}
          </a>
          <a href="#" className="hover:text-white transition-colors">
            {t('terms')}
          </a>
        </div>
      </div>
    </footer>
  );
}

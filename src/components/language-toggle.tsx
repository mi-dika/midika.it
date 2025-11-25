'use client';

import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'it' : 'en')}
      className={cn(
        'flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10',
        className
      )}
    >
      <span className={cn(language === 'en' ? 'text-white' : 'text-white/40')}>
        EN
      </span>
      <span className="text-white/20">/</span>
      <span className={cn(language === 'it' ? 'text-white' : 'text-white/40')}>
        IT
      </span>
    </button>
  );
}

'use client';

import { GlowingText } from '@/components/ui/glowing-text';
import { ArrowDown, ArrowRight, Brain, Code2, Palette } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/language-toggle';
import { FeatureCard } from '@/components/ui/feature-card';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section - Full Screen */}
      <section className="relative flex min-h-screen w-full flex-col items-center justify-between p-4 md:p-8">
        {/* Navigation */}
        <header className="relative z-10 flex w-full items-center justify-between">
          <span className="text-xl font-bold tracking-tighter">MiDika</span>
          <nav className="hidden gap-6 text-sm font-medium text-white/70 md:flex items-center">
            <a href="#" className="hover:text-white transition-colors">
              {t('manifesto')}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {t('projects')}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {t('contacts')}
            </a>
            <LanguageToggle />
          </nav>
          <div className="flex items-center gap-4">
            <LanguageToggle className="md:hidden" />
            <a
              href="mailto:info@midika.it"
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {t('talkToUs')}
            </a>
          </div>
        </header>

        {/* Center Logo */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <GlowingText text="MiDika" />
          <p className="mt-6 max-w-2xl text-lg font-light text-white/70 sm:text-xl text-center">
            {t('subtitle')}
          </p>
        </div>

        {/* Bottom Input & Arrow */}
        <div className="flex w-full flex-col items-center gap-8 pb-8">
          <div className="relative w-full max-w-md group">
            <input
              type="text"
              placeholder={t('inputPlaceholder')}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 pr-12 text-white backdrop-blur-sm transition-all placeholder:text-white/30 focus:border-white/20 focus:bg-white/10 focus:outline-none focus:ring-0"
              readOnly
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 p-2 text-white/50 transition-colors group-hover:bg-white/20 group-hover:text-orange-500">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>

          <div className="animate-bounce text-white/30">
            <ArrowDown className="h-6 w-6" />
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative z-10 flex flex-col items-center gap-24 px-4 py-24 text-center md:px-6 bg-black/50 backdrop-blur-sm">
        {/* Features Grid */}
        <div className="grid w-full max-w-6xl gap-6 md:grid-cols-3">
          <FeatureCard
            title={t('designTitle')}
            description={t('designDesc')}
            action={{ label: 'Learn more', href: '#' }}
          >
            <div className="absolute bottom-0 right-0 opacity-20">
              <Palette className="h-32 w-32 -mb-8 -mr-8 text-white" />
            </div>
          </FeatureCard>

          <FeatureCard
            title={t('engineeringTitle')}
            description={t('engineeringDesc')}
            action={{ label: 'Learn more', href: '#' }}
          >
            <div className="absolute bottom-0 right-0 opacity-20">
              <Code2 className="h-32 w-32 -mb-8 -mr-8 text-white" />
            </div>
          </FeatureCard>

          <FeatureCard
            title={t('visionTitle')}
            description={t('visionDesc')}
            action={{ label: 'Learn more', href: '#' }}
          >
            <div className="absolute bottom-0 right-0 opacity-20">
              <Brain className="h-32 w-32 -mb-8 -mr-8 text-white" />
            </div>
          </FeatureCard>
        </div>

        {/* Visual Section */}
        <div className="flex min-h-[40vh] w-full items-center justify-center">
          <h2 className="max-w-4xl text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
            {t('visualSection')}
          </h2>
        </div>

        {/* Footer */}
        <footer className="w-full max-w-6xl border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <span className="text-xs text-white/40">
              © {new Date().getFullYear()} MiDika. {t('footerText')}{' '}
              <span className="text-orange-500">♥</span> in Italia.
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
      </section>
    </div>
  );
}

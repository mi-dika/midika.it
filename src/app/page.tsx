'use client';

import { GlowingText } from '@/components/ui/glowing-text';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useChat } from '@ai-sdk/react';
import { useRef, useEffect, useState, type FormEvent } from 'react';
import type { UIMessage } from 'ai';

export default function Home() {
  const { t } = useLanguage();
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    await sendMessage({ text: userMessage });
  };

  const getMessageText = (message: UIMessage) => {
    return message.parts
      .filter(
        (part): part is { type: 'text'; text: string } => part.type === 'text'
      )
      .map((part) => part.text)
      .join('');
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section - Full Screen */}
      <section className="relative flex min-h-screen w-full flex-col items-center justify-between p-4 md:p-8 pointer-events-none">
        {/* Center Logo or Chat */}
        <div className="flex flex-1 flex-col items-center justify-center pointer-events-auto w-full max-w-2xl">
          {messages.length === 0 ? (
            <>
              <GlowingText text="MiDika" />
              <p className="mt-6 max-w-2xl text-lg font-light text-white/70 sm:text-xl text-center">
                {t('subtitle')}
              </p>
            </>
          ) : (
            <div className="w-full flex-1 overflow-y-auto max-h-[60vh] space-y-4 px-4 scrollbar-thin">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-orange-500/20 text-white'
                        : 'bg-white/5 text-white/90'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {getMessageText(message)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Input */}
        <div className="flex w-full flex-col items-center gap-8 pb-8 pointer-events-auto">
          <form onSubmit={handleSubmit} className="relative w-full max-w-md">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('inputPlaceholder')}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 pr-12 text-white backdrop-blur-sm transition-all placeholder:text-white/30 focus:border-white/20 focus:bg-white/10 focus:outline-none focus:ring-0"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 p-2 text-white/50 transition-colors hover:bg-white/20 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-6 bg-black/50 backdrop-blur-sm pointer-events-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <span className="text-xs text-white/40">
            © {new Date().getFullYear()} MiDika. {t('footerText')}{' '}
            <span className="text-orange-500">♥</span> in Italy.
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
    </div>
  );
}

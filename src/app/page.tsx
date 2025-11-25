'use client';

import { GlowingText } from '@/components/ui/glowing-text';
import { ChatMessage } from '@/components/ui/chat-message';
import { ArrowRight, Loader2, Square, X } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState, type FormEvent } from 'react';

// Pool of suggested questions (3 will be randomly selected each refresh)
const SUGGESTED_QUESTIONS = [
  'Who is MiDika?',
  'What services do you offer?',
  'Tell me about your team',
  'What technologies do you use?',
  'How can I contact you?',
  'What makes MiDika different?',
  'Do you work with startups?',
  'What is your design philosophy?',
  'How do I start a project with you?',
];

// Pool of rotating placeholders for the input field
const INPUT_PLACEHOLDERS = [
  'How can we transform your idea?',
  'What can we build for you?',
  'Tell us about your project...',
  'What challenge can we solve?',
  'Describe your vision...',
  'What would you like to create?',
  'How can we help you today?',
];

// Pool of follow-up questions to suggest after AI responses
const FOLLOW_UP_QUESTIONS = [
  'Can you tell me more about your pricing?',
  'What is your development process?',
  'How long does a typical project take?',
  'Do you offer ongoing support?',
  'Can I see some examples of your work?',
  'What technologies do you specialize in?',
  'How do I get started with a project?',
  'Do you work with international clients?',
  'What makes your approach unique?',
  'Can you help with an existing project?',
];

export default function Home() {
  const { t } = useLanguage();
  const { messages, setMessages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const isLoading = status === 'streaming' || status === 'submitted';

  // Random values - initialized with deterministic defaults to avoid hydration mismatch
  const [suggestions, setSuggestions] = useState(
    SUGGESTED_QUESTIONS.slice(0, 3)
  );
  const [placeholder, setPlaceholder] = useState(INPUT_PLACEHOLDERS[0]);
  const [followUpQuestions, setFollowUpQuestions] = useState(
    FOLLOW_UP_QUESTIONS.slice(0, 3)
  );

  // Randomize on client mount only (avoids SSR/client mismatch)
  useEffect(() => {
    const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
    setSuggestions(shuffle(SUGGESTED_QUESTIONS).slice(0, 3));
    setPlaceholder(
      INPUT_PLACEHOLDERS[Math.floor(Math.random() * INPUT_PLACEHOLDERS.length)]
    );
    setFollowUpQuestions(shuffle(FOLLOW_UP_QUESTIONS).slice(0, 3));
  }, []);

  // Regenerate follow-up questions when a new AI response arrives
  useEffect(() => {
    if (
      messages.length > 0 &&
      messages[messages.length - 1].role === 'assistant'
    ) {
      const shuffle = <T,>(arr: T[]) =>
        [...arr].sort(() => Math.random() - 0.5);
      setFollowUpQuestions(shuffle(FOLLOW_UP_QUESTIONS).slice(0, 3));
    }
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    await sendMessage({ text: userMessage });
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoading) return;
    await sendMessage({ text: suggestion });
  };

  const handleCloseChat = () => {
    setMessages([]);
    setInput('');
  };

  const handleStop = () => {
    stop();
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
              {/* Quick suggestions */}
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition-all hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="w-full flex-1 flex flex-col max-h-[60vh]">
              {/* Close chat button */}
              <div className="flex justify-end px-4 pb-2">
                <button
                  onClick={handleCloseChat}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white/70"
                >
                  <X className="h-3 w-3" />
                  Close chat
                </button>
              </div>
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto space-y-6 px-4 pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
              >
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isStreaming={status === 'streaming'}
                    isLastMessage={index === messages.length - 1}
                  />
                ))}
                {/* Follow-up suggestions after AI response */}
                {messages.length > 0 &&
                  messages[messages.length - 1].role === 'assistant' &&
                  !isLoading && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {followUpQuestions.map((question) => (
                        <button
                          key={question}
                          onClick={() => handleSuggestionClick(question)}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-white"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input */}
        <div className="flex w-full flex-col items-center gap-4 pb-8 pointer-events-auto">
          {/* Stop button when streaming */}
          {isLoading && (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/70 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              <Square className="h-3 w-3 fill-current" />
              Stop generating
            </button>
          )}

          <form onSubmit={handleSubmit} className="relative w-full max-w-md">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 pr-12 text-white backdrop-blur-sm transition-all placeholder:text-white/30 focus:border-orange-500/30 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-orange-500/20"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 p-2 text-white/50 transition-all hover:bg-orange-500/20 hover:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10 disabled:hover:text-white/50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </button>
          </form>

          {/* Powered by indicator */}
          <p className="text-xs text-white/30">
            Powered by AI • Responses may be inaccurate
          </p>
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

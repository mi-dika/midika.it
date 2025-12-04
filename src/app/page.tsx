'use client';

import { GlowingText } from '@/components/ui/glowing-text';
import { ChatMessage } from '@/components/ui/chat-message';
import { ToastContainer, type ToastLevel } from '@/components/ui/toast';
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

// Follow-up questions are now AI-generated - no fallbacks

interface Toast {
  id: string;
  message: string;
  level?: ToastLevel;
}

export default function Home() {
  const { t, language } = useLanguage();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [transientStatus, setTransientStatus] = useState<string | null>(null);
  const [completionGlow, setCompletionGlow] = useState(false);
  const transientStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { messages, setMessages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    experimental_throttle: 50, // Reduce re-renders during streaming
    onData: ({ data, type }) => {
      console.log('[onData]', { type, data }); // DEBUG

      // Handle data notifications
      if (type === 'data-notification' && data) {
        const payload = data as {
          type?: string;
          message?: string;
          level?: ToastLevel;
          questions?: string[];
        };

        // Check if it's a follow-up questions payload
        if (payload.type === 'followup' && payload.questions) {
          if (
            Array.isArray(payload.questions) &&
            payload.questions.length > 0
          ) {
            setFollowUpQuestions(payload.questions);
          }
          return;
        }

        // Handle transient status notifications
        if (payload.message) {
          // Cancel any existing timeout before setting a new one
          if (transientStatusTimeoutRef.current) {
            clearTimeout(transientStatusTimeoutRef.current);
            transientStatusTimeoutRef.current = null;
          }

          setTransientStatus(payload.message);
          // Auto-clear after 2 seconds unless it's a completion message
          const timeoutDuration = payload.level !== 'success' ? 2000 : 1000;
          transientStatusTimeoutRef.current = setTimeout(() => {
            setTransientStatus(null);
            transientStatusTimeoutRef.current = null;
          }, timeoutDuration);
        }
      }
    },
    onFinish: () => {
      // Trigger subtle completion animation
      setCompletionGlow(true);
      setTimeout(() => setCompletionGlow(false), 1000);
    },
    onError: (error) => {
      // Show error toast
      const toastId = `error-${Date.now()}`;
      setToasts((prev) => [
        ...prev,
        {
          id: toastId,
          message: t('errorOccurred'),
          level: 'error',
        },
      ]);
      // Auto-remove after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 5000);
    },
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
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);

  // Randomize on client mount only (avoids SSR/client mismatch)
  useEffect(() => {
    // Use setTimeout to avoid synchronous state updates during mount which can trigger cascading renders
    const timer = setTimeout(() => {
      const shuffle = <T,>(arr: T[]) =>
        [...arr].sort(() => Math.random() - 0.5);
      setSuggestions(shuffle(SUGGESTED_QUESTIONS).slice(0, 3));
      setPlaceholder(
        INPUT_PLACEHOLDERS[
          Math.floor(Math.random() * INPUT_PLACEHOLDERS.length)
        ]
      );
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Follow-up questions are now received via onData callback (parallel generation)
  // No need for a separate effect - they arrive with the stream

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transientStatusTimeoutRef.current) {
        clearTimeout(transientStatusTimeoutRef.current);
      }
    };
  }, []);

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

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="flex flex-col w-full">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Hero Section - Full Screen */}
      <section className="relative flex min-h-screen w-full flex-col items-center justify-between p-4 md:p-8 pointer-events-none overflow-hidden">
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
                    className="rounded-full border border-white/10 bg-black/40 backdrop-blur-sm px-4 py-2 text-sm text-white/70 transition-all hover:border-primary/50 hover:bg-black/60 hover:backdrop-blur-md hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="w-full flex-1 flex flex-col max-h-[calc(100vh-180px)]">
              {/* Close chat button */}
              <div className="flex justify-end px-4 pb-2">
                <button
                  onClick={handleCloseChat}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white/70"
                >
                  <X className="h-3 w-3" />
                  {t('closeChat')}
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
                    statusMessage={
                      index === messages.length - 1 ? transientStatus : null
                    }
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
                          className="rounded-full border border-white/10 bg-black/40 backdrop-blur-sm px-3 py-1.5 text-xs text-white/60 transition-all hover:border-primary/50 hover:bg-black/60 hover:backdrop-blur-md hover:text-white"
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
              {t('stopGenerating')}
            </button>
          )}

          <form
            onSubmit={handleSubmit}
            className={`relative w-full max-w-md transition-all duration-1000 ${
              completionGlow
                ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-black'
                : ''
            }`}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-6 py-4 pr-12 text-white backdrop-blur-sm transition-all placeholder:text-white/40 focus:border-primary/50 focus:bg-black/60 focus:backdrop-blur-md focus:outline-none focus:ring-1 focus:ring-primary/30"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 p-2 text-white/50 transition-all hover:bg-primary/20 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10 disabled:hover:text-white/50"
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

      {/* Footer - hidden when chat is active */}
      {messages.length === 0 && (
        <footer className="w-full border-t border-white/10 py-6 bg-black/50 backdrop-blur-sm pointer-events-auto">
          <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
            <span className="text-xs text-white/40">
              © {new Date().getFullYear()} MiDika. {t('footerText')}{' '}
              <span className="text-primary">♥</span> in Italy.
            </span>
            <div className="flex gap-6 text-xs text-white/40">
              <a
                href={`/privacy?lang=${language}`}
                className="hover:text-white transition-colors"
              >
                {t('privacy')}
              </a>
              <a
                href={`/cookie-policy?lang=${language}`}
                className="hover:text-white transition-colors"
              >
                {t('cookiePolicy')}
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

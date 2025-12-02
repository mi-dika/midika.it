'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConsent } from './consent-provider';
import { ShieldCheck } from 'lucide-react';

export function ConsentBanner() {
  const { consentStatus, acceptConsent, rejectConsent } = useConsent();
  const [delayPassed, setDelayPassed] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
  });

  // Only set delayPassed to true after a timeout - this is the only setState in the effect
  useEffect(() => {
    // Small delay to prevent hydration mismatch flash and allow animation
    const timer = setTimeout(() => setDelayPassed(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Derive visibility from consent status and delay
  const isVisible = consentStatus === 'unknown' && delayPassed;

  const handleAcceptSelected = () => {
    if (preferences.analytics) {
      acceptConsent();
    } else {
      rejectConsent();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-[400px]"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl shadow-2xl">
            {/* Decorative gradient blob */}
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10">
                    <ShieldCheck className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      Privacy Choice
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      We value your privacy. Choose how we handle your data.
                    </p>
                  </div>
                </div>
              </div>

              {!showPreferences ? (
                <>
                  <div className="text-xs text-zinc-400 leading-relaxed">
                    We use cookies to enhance your experience and analyze our
                    traffic. Your data is safe with us and we are 100% GDPR
                    compliant.
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={rejectConsent}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors"
                    >
                      Reject All
                    </button>
                    <button
                      onClick={acceptConsent}
                      className="rounded-lg bg-orange-500 px-4 py-2.5 text-xs font-medium text-white hover:bg-orange-600 transition-colors shadow-[0_0_20px_-5px_rgba(249,115,22,0.5)]"
                    >
                      Accept All
                    </button>
                  </div>
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="w-full text-center text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors underline decoration-zinc-700 underline-offset-2"
                  >
                    Manage Preferences
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-white">
                          Necessary
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          Required for the site to work
                        </span>
                      </div>
                      <div className="h-4 w-4 rounded border border-orange-500/50 bg-orange-500/20 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-sm bg-orange-500" />
                      </div>
                    </div>
                    <div
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() =>
                        setPreferences((p) => ({
                          ...p,
                          analytics: !p.analytics,
                        }))
                      }
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-white">
                          Analytics
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          Help us improve our website
                        </span>
                      </div>
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${preferences.analytics ? 'border-orange-500 bg-orange-500' : 'border-zinc-700 bg-transparent'}`}
                      >
                        {preferences.analytics && (
                          <div className="h-2 w-2 rounded-sm bg-white" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      onClick={() => setShowPreferences(false)}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleAcceptSelected}
                      className="rounded-lg bg-white px-4 py-2.5 text-xs font-medium text-black hover:bg-zinc-200 transition-colors"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

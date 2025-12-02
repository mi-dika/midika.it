'use client';

import React, { createContext, useContext, useSyncExternalStore } from 'react';
import { env } from '@/env';

type ConsentStatus = 'unknown' | 'accepted' | 'rejected';

interface ConsentContextType {
  consentStatus: ConsentStatus;
  acceptConsent: () => void;
  rejectConsent: () => void;
  resetConsent: () => void;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

// Helper to get consent status from localStorage
function getConsentStatusFromStorage(): ConsentStatus {
  if (typeof window === 'undefined') return 'unknown';
  const storedConsent = localStorage.getItem('midika_consent_status');
  if (storedConsent === 'accepted' || storedConsent === 'rejected') {
    return storedConsent as ConsentStatus;
  }
  return 'unknown';
}

// Storage event listeners for useSyncExternalStore
const consentStorageListeners = new Set<() => void>();

function subscribeToConsentStorage(callback: () => void) {
  consentStorageListeners.add(callback);
  return () => consentStorageListeners.delete(callback);
}

function notifyConsentStorageListeners() {
  consentStorageListeners.forEach((listener) => listener());
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  // Use useSyncExternalStore to sync with localStorage (React 18+ recommended pattern)
  const consentStatus = useSyncExternalStore(
    subscribeToConsentStorage,
    getConsentStatusFromStorage,
    () => 'unknown' // Server snapshot - always 'unknown' to avoid hydration mismatch
  );

  const syncWithIubenda = async (status: 'accepted' | 'rejected') => {
    if (!env.NEXT_PUBLIC_IUBENDA_PUBLIC_API_KEY) {
      // Only warn in development to avoid console noise in prod if keys are missing
      if (process.env.NODE_ENV === 'development') {
        console.warn('Iubenda Public API Key is missing. Skipping sync.');
      }
      return;
    }

    try {
      let subjectId = localStorage.getItem('midika_consent_subject_id');
      if (!subjectId) {
        subjectId = crypto.randomUUID();
        localStorage.setItem('midika_consent_subject_id', subjectId);
      }

      const response = await fetch(
        'https://consent.iubenda.com/public/consent',
        {
          method: 'POST',
          headers: {
            ApiKey: env.NEXT_PUBLIC_IUBENDA_PUBLIC_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: {
              id: subjectId,
            },
            preferences: {
              privacy_policy: status === 'accepted',
            },
            legal_notices: [
              {
                identifier: 'privacy_policy',
              },
            ],
            proofs: [
              {
                content: '{}',
                form: 'consent_banner',
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        console.error('Failed to sync with Iubenda:', await response.text());
      }
    } catch (error) {
      console.error('Error syncing with Iubenda:', error);
    }
  };

  const acceptConsent = () => {
    localStorage.setItem('midika_consent_status', 'accepted');
    notifyConsentStorageListeners();
    syncWithIubenda('accepted');
  };

  const rejectConsent = () => {
    localStorage.setItem('midika_consent_status', 'rejected');
    notifyConsentStorageListeners();
    syncWithIubenda('rejected');
  };

  const resetConsent = () => {
    localStorage.removeItem('midika_consent_status');
    notifyConsentStorageListeners();
  };

  return (
    <ConsentContext.Provider
      value={{ consentStatus, acceptConsent, rejectConsent, resetConsent }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
}

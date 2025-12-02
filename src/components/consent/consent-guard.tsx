'use client';

import { useConsent } from './consent-provider';

interface ConsentGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ConsentGuard({ children, fallback = null }: ConsentGuardProps) {
  const { consentStatus } = useConsent();

  if (consentStatus === 'accepted') {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type ToastLevel = 'info' | 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  level?: ToastLevel;
  duration?: number;
  onClose?: () => void;
}

export function Toast({
  message,
  level = 'info',
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Trigger slide-in animation
    setIsVisible(true);

    // Progress bar animation
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for fade-out animation
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [duration, onClose]);

  const levelStyles = {
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-200',
    success: 'bg-green-500/20 border-green-500/30 text-green-200',
    error: 'bg-red-500/20 border-red-500/30 text-red-200',
    warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200',
  };

  return (
    <div
      className={cn(
        'min-w-[300px] max-w-md',
        'rounded-lg border backdrop-blur-sm px-4 py-3 shadow-lg',
        'transform transition-all duration-300 ease-out pointer-events-auto',
        levelStyles[level],
        isVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-2 opacity-0 pointer-events-none'
      )}
    >
      <div className="flex items-start gap-3">
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="shrink-0 rounded p-1 transition-colors hover:bg-white/10"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 rounded-b-lg overflow-hidden">
        <div
          className="h-full bg-white/40 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; level?: ToastLevel }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          level={toast.level}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

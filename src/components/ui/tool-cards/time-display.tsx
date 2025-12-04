'use client';

import { Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface TimeDisplayProps {
  timeString: string;
}

export function TimeDisplay({ timeString }: TimeDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>(timeString);

  useEffect(() => {
    setIsVisible(true);

    // Extract time from the string if it's in a specific format
    // Update every second for live clock effect
    const interval = setInterval(() => {
      const now = new Date();
      const milanTime = now.toLocaleString('en-US', {
        timeZone: 'Europe/Rome',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(milanTime);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Extract just the time part for display
  const timeMatch = currentTime.match(/(\d{1,2}:\d{2}:\d{2})/);
  const timeOnly = timeMatch ? timeMatch[1] : '';
  const datePart = currentTime.replace(/(\d{1,2}:\d{2}:\d{2})/, '').trim();

  return (
    <div
      className={cn(
        'my-2 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm',
        'transform transition-all duration-500 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
          <Clock className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Current Time</h3>
          <p className="text-xs text-white/50 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Milan, Italy
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* Large Time Display */}
        <div className="text-center">
          <div className="mb-2 text-4xl font-bold tracking-tight text-white tabular-nums">
            {timeOnly || '--:--:--'}
          </div>
          <div className="text-sm text-white/60">{datePart}</div>
        </div>

        {/* Pulsing indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
          <span className="text-xs text-white/40">Live</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';

interface TimeFilterProps {
  currentDays?: number;
}

/**
 * Time range filter component
 * Applies KISS principle: simple URL-based filtering
 */
export function TimeFilter({ currentDays }: TimeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const options = [
    { label: 'Today', days: 1 },
    { label: '7 days', days: 7 },
    { label: '30 days', days: 30 },
    { label: 'All time', days: undefined },
  ];

  const handleChange = (days: number | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (days) {
      params.set('days', days.toString());
    } else {
      params.delete('days');
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-white/60" />
      <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
        {options.map((option) => {
          const isActive = currentDays === option.days;
          return (
            <button
              key={option.label}
              onClick={() => handleChange(option.days)}
              className={`rounded px-3 py-1 text-xs transition-colors ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

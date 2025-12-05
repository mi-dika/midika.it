import React from 'react';
import { cn } from '@/lib/utils';

interface GlowingTextProps {
  text: string;
  className?: string;
}

export const GlowingText: React.FC<GlowingTextProps> = ({
  text,
  className,
}) => {
  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Blurred glow behind */}
      <h1
        className="absolute select-none text-5xl font-bold tracking-tighter text-white blur-xl sm:blur-2xl sm:text-7xl md:text-9xl opacity-50 transform-gpu"
        aria-hidden="true"
      >
        {text}
      </h1>
      {/* Main text */}
      <h1 className="relative z-10 text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 sm:text-7xl md:text-9xl">
        {text}
      </h1>
    </div>
  );
};

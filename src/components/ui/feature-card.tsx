'use client';

import { cn } from '@/lib/utils';
import React, { useRef, useState } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  action?: {
    label: string;
    href: string;
  };
  children?: React.ReactNode;
}

export function FeatureCard({
  title,
  description,
  icon,
  className,
  action,
  children,
}: FeatureCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black px-8 py-10 transition-colors duration-500',
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,.1), transparent 40%)`,
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <h3 className="mb-4 text-xl font-medium tracking-tight text-white">
          {title}
        </h3>
        <p className="mb-8 text-sm leading-relaxed text-white/60">
          {description}
        </p>

        <div className="mt-auto flex-1">{children}</div>

        {action && (
          <div className="mt-8">
            <a
              href={action.href}
              className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10"
            >
              {action.label} <span className="ml-2">↗</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

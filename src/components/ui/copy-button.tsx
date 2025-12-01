'use client';

import { useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function CopyButton({ text, className, size = 'md' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const buttonSize = size === 'sm' ? 'p-1.5' : 'p-2';

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'rounded-md bg-white/10 text-white/60 transition-all hover:bg-white/20 hover:text-white',
        'active:scale-95',
        buttonSize,
        className
      )}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <Check className={cn(iconSize, 'text-green-400')} />
      ) : (
        <Copy className={iconSize} />
      )}
    </button>
  );
}

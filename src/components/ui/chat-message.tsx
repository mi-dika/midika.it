'use client';

import type { UIMessage } from 'ai';
import { formatDistanceToNow } from 'date-fns';
import { User, Sparkles, Building2, Clock, Briefcase } from 'lucide-react';
import { Markdown } from './markdown';
import { CopyButton } from './copy-button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ChatMessageProps {
  message: UIMessage;
  isStreaming?: boolean;
  isLastMessage?: boolean;
}

// Extract text content from message parts
function getMessageText(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: 'text'; text: string } => part.type === 'text'
    )
    .map((part) => part.text)
    .join('');
}

// Thinking indicator with animated dots
function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1 text-white/50">
      <span>Thinking</span>
      <span className="flex gap-0.5">
        <span
          className="animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '1s' }}
        >
          .
        </span>
        <span
          className="animate-bounce"
          style={{ animationDelay: '150ms', animationDuration: '1s' }}
        >
          .
        </span>
        <span
          className="animate-bounce"
          style={{ animationDelay: '300ms', animationDuration: '1s' }}
        >
          .
        </span>
      </span>
    </div>
  );
}

// Tool execution card
interface ToolCardProps {
  toolName: string;
  state: string;
  output?: string;
}

function ToolCard({ toolName, state, output }: ToolCardProps) {
  const getToolIcon = () => {
    switch (toolName) {
      case 'getCompanyInfo':
        return <Building2 className="h-4 w-4" />;
      case 'getServices':
        return <Briefcase className="h-4 w-4" />;
      case 'getCurrentTime':
        return <Clock className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getToolLabel = () => {
    switch (toolName) {
      case 'getCompanyInfo':
        return 'Company Info';
      case 'getServices':
        return 'Our Services';
      case 'getCurrentTime':
        return 'Current Time';
      default:
        return toolName;
    }
  };

  const isLoading = state === 'call' || state === 'partial-call';
  const hasOutput = state === 'result' && output;

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-white/10 bg-white/5">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2">
        <span className="text-orange-400">{getToolIcon()}</span>
        <span className="text-xs font-medium text-white/70">
          {getToolLabel()}
        </span>
        {isLoading && (
          <span className="ml-auto text-xs text-white/40">Loading...</span>
        )}
      </div>
      {hasOutput && (
        <div className="p-3 text-sm text-white/80">
          <Markdown content={output} />
        </div>
      )}
    </div>
  );
}

export function ChatMessage({
  message,
  isStreaming,
  isLastMessage,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const text = getMessageText(message);
  const hasText = text.length > 0;
  const showThinking = isLastMessage && isStreaming && !hasText && !isUser;

  // Track message creation time (client-side only for now)
  const [timestamp] = useState(() => new Date());

  // Find tool parts - look for parts that have toolName property
  const toolParts = message.parts.filter((part) => {
    return 'toolName' in part && typeof part.toolName === 'string';
  });

  return (
    <div
      className={cn(
        'group flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-orange-500/20 text-orange-400'
            : 'bg-white/10 text-white/70'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          'relative max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-orange-500/20 text-white'
            : 'bg-white/5 text-white/90 backdrop-blur-sm'
        )}
      >
        {/* Thinking indicator */}
        {showThinking && <ThinkingIndicator />}

        {/* Tool cards */}
        {toolParts.map((part, index) => {
          const toolPart = part as {
            toolName: string;
            state?: string;
            result?: string;
            toolCallId?: string;
          };
          return (
            <ToolCard
              key={toolPart.toolCallId || index}
              toolName={toolPart.toolName}
              state={toolPart.state || 'call'}
              output={toolPart.result}
            />
          );
        })}

        {/* Text content */}
        {hasText && (
          <div className="relative">
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap">{text}</p>
            ) : (
              <div className="text-sm">
                <Markdown content={text} />
                {/* Typing cursor */}
                {isStreaming && isLastMessage && (
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-orange-400" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Hover actions */}
        <div
          className={cn(
            'absolute -bottom-6 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100',
            isUser ? 'right-0' : 'left-0'
          )}
        >
          {/* Timestamp */}
          <span className="text-xs text-white/30">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </span>
          {/* Copy button */}
          {hasText && <CopyButton text={text} size="sm" />}
        </div>
      </div>
    </div>
  );
}

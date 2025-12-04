'use client';

import type { UIMessage } from 'ai';
import { formatDistanceToNow } from 'date-fns';
import {
  User,
  Sparkles,
  Building2,
  Clock,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Markdown } from './markdown';
import { CopyButton } from './copy-button';
import { CompanyInfoCard } from './tool-cards/company-info-card';
import { ServicesGrid } from './tool-cards/services-grid';
import { TimeDisplay } from './tool-cards/time-display';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ChatMessageProps {
  message: UIMessage;
  isStreaming?: boolean;
  isLastMessage?: boolean;
  statusMessage?: string | null;
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

// Thinking indicator with animated dots and status message
function ThinkingIndicator({ status }: { status?: string | null }) {
  // Show specific status or default to "Thinking"
  const displayText = status || 'Thinking';

  return (
    <div className="flex items-center gap-2 text-white/50">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      <span className="animate-in fade-in duration-300">{displayText}</span>
    </div>
  );
}

// Tool execution card with generative UI
interface ToolCardProps {
  toolName: string;
  state: string;
  output?: unknown;
}

function ToolCard({ toolName, state, output }: ToolCardProps) {
  // AI SDK v5 states: 'input-streaming', 'input-available', 'output-available', 'output-error'
  // Legacy states: 'call', 'partial-call', 'result'
  const isLoading =
    state === 'call' ||
    state === 'partial-call' ||
    state === 'input-streaming' ||
    state === 'input-available';
  const hasOutput =
    (state === 'result' || state === 'output-available') && output;

  // Parse output for structured rendering - handle both string and object
  const parseOutput = (output: unknown) => {
    if (typeof output === 'object' && output !== null) {
      return output; // Already an object
    }
    if (typeof output === 'string') {
      try {
        return JSON.parse(output);
      } catch {
        return null;
      }
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="my-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-xs text-white/60">Loading...</span>
      </div>
    );
  }

  if (!hasOutput) return null;

  const parsedData = parseOutput(output);

  // Convert output to string for fallback rendering
  const outputString =
    typeof output === 'string' ? output : JSON.stringify(output, null, 2);

  // Render tool-specific generative UI
  switch (toolName) {
    case 'getCompanyInfo':
      if (parsedData) {
        return <CompanyInfoCard data={parsedData} />;
      }
      // Fallback to markdown if JSON parsing fails
      return (
        <div className="my-2 overflow-hidden rounded-lg border border-white/10 bg-white/5">
          <div className="p-3 text-sm text-white/80">
            <Markdown content={outputString} />
          </div>
        </div>
      );

    case 'getServices':
      if (parsedData && Array.isArray(parsedData)) {
        return <ServicesGrid services={parsedData} />;
      }
      // Fallback to markdown if JSON parsing fails
      return (
        <div className="my-2 overflow-hidden rounded-lg border border-white/10 bg-white/5">
          <div className="p-3 text-sm text-white/80">
            <Markdown content={outputString} />
          </div>
        </div>
      );

    case 'getCurrentTime':
      if (parsedData && parsedData.time) {
        return <TimeDisplay timeString={parsedData.time} />;
      }
      // Fallback: try to extract time from markdown
      const timeMatch = outputString.match(/\*\*(.+?)\*\*/);
      if (timeMatch) {
        return <TimeDisplay timeString={timeMatch[1]} />;
      }
      return (
        <div className="my-2 overflow-hidden rounded-lg border border-white/10 bg-white/5">
          <div className="p-3 text-sm text-white/80">
            <Markdown content={outputString} />
          </div>
        </div>
      );

    default:
      // Generic tool card for unknown tools
      return (
        <div className="my-2 overflow-hidden rounded-lg border border-white/10 bg-white/5">
          <div className="p-3 text-sm text-white/80">
            <Markdown content={outputString} />
          </div>
        </div>
      );
  }
}

// Reasoning display component
interface ReasoningDisplayProps {
  reasoning: string;
}

function ReasoningDisplay({ reasoning }: ReasoningDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="my-2 rounded-lg border border-white/10 bg-white/5 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-xs font-medium text-white/70 flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-primary/70" />
          View AI thinking process
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-white/50" />
        ) : (
          <ChevronDown className="h-4 w-4 text-white/50" />
        )}
      </button>
      {isExpanded && (
        <div className="border-t border-white/10 px-3 py-2">
          <pre className="text-xs text-white/60 whitespace-pre-wrap font-mono bg-black/20 rounded p-2 overflow-x-auto">
            {reasoning}
          </pre>
        </div>
      )}
    </div>
  );
}

export function ChatMessage({
  message,
  isStreaming,
  isLastMessage,
  statusMessage,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const text = getMessageText(message);
  const hasText = text.length > 0;
  const showThinking = isLastMessage && isStreaming && !hasText && !isUser;

  // Track message creation time (client-side only for now)
  const [timestamp] = useState(() => new Date());

  // Find tool parts - AI SDK v5 uses 'tool-{toolName}' as part type
  const toolParts = message.parts.filter((part) => {
    const partType = part.type;

    // AI SDK v5: type is 'tool-{toolName}' (e.g., 'tool-getCompanyInfo')
    if (partType.startsWith('tool-')) {
      const toolName = partType.replace('tool-', '');
      return toolName !== 'suggestFollowUpQuestions';
    }

    // Legacy: check for tool-invocation type
    if (partType === 'tool-invocation') {
      const toolInvocation = (part as any).toolInvocation;
      return (
        toolInvocation?.toolName &&
        toolInvocation.toolName !== 'suggestFollowUpQuestions'
      );
    }

    // Legacy: direct toolName property
    if ('toolName' in part) {
      const toolName = (part as any).toolName;
      return (
        typeof toolName === 'string' && toolName !== 'suggestFollowUpQuestions'
      );
    }

    return false;
  });

  // Find reasoning parts
  const reasoningParts = message.parts.filter(
    (part) => part.type === 'reasoning'
  );

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
          isUser ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/70'
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
            ? 'bg-primary/20 text-white'
            : 'bg-white/5 text-white/90 backdrop-blur-sm'
        )}
      >
        {/* Thinking indicator with status */}
        {showThinking && <ThinkingIndicator status={statusMessage} />}

        {/* Reasoning display */}
        {reasoningParts.map((part, index) => {
          if (part.type === 'reasoning') {
            return (
              <ReasoningDisplay
                key={`reasoning-${index}`}
                reasoning={part.text}
              />
            );
          }
          return null;
        })}

        {/* Tool cards with generative UI */}
        {toolParts.map((part, index) => {
          const partType = part.type;
          let toolName: string;
          let state: string;
          let output: unknown;
          let toolCallId: string | undefined;

          // AI SDK v5: type is 'tool-{toolName}'
          if (partType.startsWith('tool-')) {
            toolName = partType.replace('tool-', '');
            const toolPart = part as any;
            state = toolPart.state || 'output-available';
            output = toolPart.output;
            toolCallId = toolPart.toolCallId;
          } else if (partType === 'tool-invocation') {
            // Legacy: tool-invocation type
            const toolInvocation = (part as any).toolInvocation;
            toolName = toolInvocation?.toolName || '';
            state = toolInvocation?.state || 'call';
            output = toolInvocation?.result;
            toolCallId = toolInvocation?.toolCallId;
          } else {
            // Legacy: direct toolName property
            const toolPart = part as any;
            toolName = toolPart.toolName || '';
            state = toolPart.state || 'call';
            output = toolPart.result;
            toolCallId = toolPart.toolCallId;
          }

          return (
            <ToolCard
              key={toolCallId || `tool-${index}`}
              toolName={toolName}
              state={state}
              output={output}
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
                  <span className="ml-1 inline-block h-2 w-2 rounded-full animate-pulse bg-primary" />
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

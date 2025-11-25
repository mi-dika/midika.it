'use client';

import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { CopyButton } from './copy-button';
import type { ReactNode, ReactElement } from 'react';

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  const components: Components = {
    // Custom code block with copy button
    pre({ children }) {
      // Try to extract code content for copy button
      let codeContent = '';
      if (children && typeof children === 'object') {
        const childElement = children as ReactElement<{
          children?: ReactNode;
        }>;
        if (childElement.props?.children) {
          codeContent =
            typeof childElement.props.children === 'string'
              ? childElement.props.children
              : '';
        }
      }

      return (
        <div className="group relative">
          <pre className="overflow-x-auto rounded-lg bg-black/40 p-4 text-sm">
            {children}
          </pre>
          {codeContent && (
            <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
              <CopyButton text={codeContent} size="sm" />
            </div>
          )}
        </div>
      );
    },
    // Inline code styling
    code({ className, children }) {
      const isInline = !className;
      if (isInline) {
        return (
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-orange-400">
            {children}
          </code>
        );
      }
      return <code className={className}>{children}</code>;
    },
    // Links
    a({ href, children }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-400 underline decoration-orange-400/30 underline-offset-2 transition-colors hover:text-orange-300 hover:decoration-orange-300/50"
        >
          {children}
        </a>
      );
    },
    // Paragraphs
    p({ children }) {
      return <p className="mb-3 last:mb-0">{children}</p>;
    },
    // Lists
    ul({ children }) {
      return <ul className="mb-3 list-disc pl-4 last:mb-0">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="mb-3 list-decimal pl-4 last:mb-0">{children}</ol>;
    },
    li({ children }) {
      return <li className="mb-1">{children}</li>;
    },
    // Headings
    h1({ children }) {
      return <h1 className="mb-3 text-lg font-semibold">{children}</h1>;
    },
    h2({ children }) {
      return <h2 className="mb-2 text-base font-semibold">{children}</h2>;
    },
    h3({ children }) {
      return <h3 className="mb-2 text-sm font-semibold">{children}</h3>;
    },
    // Blockquotes
    blockquote({ children }) {
      return (
        <blockquote className="mb-3 border-l-2 border-orange-500/50 pl-3 italic text-white/70">
          {children}
        </blockquote>
      );
    },
    // Horizontal rule
    hr() {
      return <hr className="my-4 border-white/10" />;
    },
    // Strong/Bold
    strong({ children }) {
      return <strong className="font-semibold text-white">{children}</strong>;
    },
  };

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown rehypePlugins={[rehypeHighlight]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Simple wrapper for ReactNode that might be markdown
export function MarkdownOrText({ children }: { children: ReactNode }) {
  if (typeof children === 'string') {
    return <Markdown content={children} />;
  }
  return <>{children}</>;
}

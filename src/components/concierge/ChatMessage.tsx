"use client";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

// ---------------------------------------------------------------------------
// Minimal Markdown Renderer
// ---------------------------------------------------------------------------
// Handles **bold**, bullet lists, and headers for assistant responses.

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listKey = 0;

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey}`} className="space-y-1.5 my-2">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-2 text-[14px] leading-relaxed">
              <span className="text-[var(--color-ember)] mt-[2px] shrink-0">
                &bull;
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      listItems = [];
      listKey++;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Bullet list items
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listItems.push(trimmed.slice(2));
      continue;
    }

    // Flush any pending list
    flushList();

    // Empty lines
    if (trimmed === "") {
      elements.push(<div key={`br-${i}`} className="h-2" />);
      continue;
    }

    // Headers
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4
          key={`h4-${i}`}
          className="text-[13px] font-semibold text-[var(--color-ink)] uppercase tracking-[0.08em] mt-4 mb-1"
        >
          {trimmed.slice(4)}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-[15px] font-semibold text-[var(--color-canopy)] mt-4 mb-1"
        >
          {trimmed.slice(3)}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith("# ")) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-[16px] font-semibold text-[var(--color-canopy)] mt-4 mb-1"
        >
          {trimmed.slice(2)}
        </h2>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="text-[14px] leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList();
  return elements;
}

/** Render inline markdown: **bold** and `code` */
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // Bold
      parts.push(
        <strong key={match.index} className="font-semibold text-[var(--color-ink)]">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Code
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 bg-[var(--color-parchment)] rounded text-[13px] font-mono text-[var(--color-canopy-light)]"
        >
          {match[3]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

// ---------------------------------------------------------------------------
// ChatMessage Component
// ---------------------------------------------------------------------------

export default function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-up",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar — assistant only */}
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-canopy)] flex items-center justify-center mt-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[75%]",
          isUser
            ? "bg-[var(--color-canopy)] text-white rounded-[2px] rounded-br-[12px] px-5 py-3.5"
            : "bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-[2px] rounded-bl-[12px] px-5 py-4"
        )}
      >
        {isUser ? (
          <p className="text-[14px] leading-relaxed">{message.content}</p>
        ) : (
          <div className="space-y-0.5 text-[var(--color-ink-light)]">
            {renderMarkdown(message.content)}
            {isStreaming && (
              <span className="inline-block w-[6px] h-[16px] bg-[var(--color-canopy)] ml-0.5 animate-pulse" />
            )}
          </div>
        )}
      </div>

      {/* Avatar — user only */}
      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-ember)] flex items-center justify-center mt-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </div>
  );
}

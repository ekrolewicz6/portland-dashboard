"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, RotateCcw, Sparkles } from "lucide-react";
import ChatMessage, { type Message } from "./ChatMessage";
import { STARTER_QUESTIONS } from "@/lib/concierge/system-prompt";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// ChatInterface Component
// ---------------------------------------------------------------------------

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  const handleInputChange = (value: string) => {
    setInput(value);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
    }
  };

  // ── Send message ──────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: content.trim(),
      };

      const assistantId = generateId();
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setInput("");
      setIsLoading(true);
      setStreamingId(assistantId);

      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      // Build conversation history for the API
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetch("/api/concierge/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.error || `Server responded with ${response.status}`
          );
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });

          // Update the assistant message with accumulated text
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m
            )
          );
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          // User cancelled — leave partial message
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : "Something went wrong";

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: `I apologize, but I encountered an error: ${errorMessage}. Please try again.`,
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
        setStreamingId(null);
        abortControllerRef.current = null;
      }
    },
    [isLoading, messages]
  );

  // ── Handlers ──────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setInput("");
    setIsLoading(false);
    setStreamingId(null);
  };

  const isEmpty = messages.length === 0;

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {isEmpty ? (
          // ── Empty state ──
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-fade-up">
            <div className="w-14 h-14 rounded-full bg-[var(--color-canopy)] flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-[var(--color-ember)]" />
            </div>
            <h2 className="font-editorial-normal text-2xl sm:text-3xl text-[var(--color-canopy)] text-center mb-2">
              How can I help your business?
            </h2>
            <p className="text-[14px] text-[var(--color-ink-muted)] text-center max-w-md mb-8 leading-relaxed">
              I&apos;m your Portland business advisor. Ask me about taxes,
              permits, zoning, SDC fees, or PCB certification benefits.
            </p>

            {/* Starter questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
              {STARTER_QUESTIONS.map((question) => (
                <button
                  key={question}
                  onClick={() => sendMessage(question)}
                  className="text-left px-4 py-3 text-[13px] text-[var(--color-ink-light)] bg-white border border-[var(--color-parchment)] rounded-sm hover:border-[var(--color-sage)] hover:bg-[var(--color-paper-warm)] transition-all duration-200 leading-snug"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // ── Chat messages ──
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isStreaming={message.id === streamingId}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-[var(--color-parchment)] bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            {/* Reset button */}
            {!isEmpty && (
              <button
                type="button"
                onClick={handleReset}
                className="shrink-0 w-10 h-10 flex items-center justify-center text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-parchment)] rounded transition-colors"
                title="New conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Portland taxes, permits, zoning..."
                rows={1}
                disabled={isLoading}
                className={cn(
                  "w-full resize-none px-4 py-3 pr-12 bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-canopy)] focus:ring-1 focus:ring-[var(--color-canopy)] transition-colors leading-relaxed",
                  isLoading && "opacity-60"
                )}
              />
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "shrink-0 w-10 h-10 flex items-center justify-center rounded transition-all duration-200",
                input.trim() && !isLoading
                  ? "bg-[var(--color-canopy)] text-white hover:bg-[var(--color-canopy-mid)]"
                  : "bg-[var(--color-parchment)] text-[var(--color-ink-muted)] cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-[11px] text-[var(--color-ink-muted)] text-center mt-3 tracking-wide">
            AI-powered guidance — not a substitute for professional tax or legal
            advice
          </p>
        </div>
      </div>
    </div>
  );
}

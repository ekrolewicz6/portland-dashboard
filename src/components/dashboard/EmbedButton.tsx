"use client";

import { useState } from "react";
import { Code2, X, Check } from "lucide-react";

interface EmbedButtonProps {
  question: string;
}

export default function EmbedButton({ question }: EmbedButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedCode = `<iframe src="https://portlandcommons.org/dashboard/embed/${question}" width="400" height="300" frameborder="0" title="Portland Civic Lab - ${question}"></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = embedCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)] bg-[var(--color-parchment)]/50 hover:bg-[var(--color-parchment)] rounded-sm transition-colors"
      >
        <Code2 className="w-3.5 h-3.5" />
        Embed
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[420px] bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm shadow-lg z-50 animate-slide-down">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-parchment)]">
            <h4 className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
              Embed This Metric
            </h4>
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-[var(--color-ink-muted)]/50 hover:text-[var(--color-ink)] rounded-sm transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            <p className="text-[12px] text-[var(--color-ink-muted)] mb-3">
              Copy the code below to embed this metric on your website or article.
            </p>
            <div className="relative">
              <pre className="bg-[var(--color-canopy)] text-[var(--color-lichen)] text-[11px] font-mono p-3 rounded-sm overflow-x-auto leading-relaxed">
                {embedCode}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white/70 bg-white/10 hover:bg-white/20 rounded-sm transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied
                  </>
                ) : (
                  "Copy"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  title: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // Dismissing the share sheet is a deliberate choice, not a failure.
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission can be refused; leave the button as it was.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/25 rounded-sm transition-all"
      title={`Share: ${title}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Link copied
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5" />
          Share
        </>
      )}
    </button>
  );
}

"use client";

import { Download } from "lucide-react";

interface ExportButtonProps {
  question: string;
}

export default function ExportButton({ question }: ExportButtonProps) {
  const handleExport = () => {
    window.open(`/api/export/${question}`, "_blank");
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)] bg-[var(--color-parchment)]/50 hover:bg-[var(--color-parchment)] rounded-sm transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      Export CSV
    </button>
  );
}

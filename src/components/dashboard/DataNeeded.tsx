"use client";

import { Database, Download, FileText, Key, CreditCard, ExternalLink } from "lucide-react";

interface DataAction {
  label: string;
  href?: string;
  type: "api_key" | "prr" | "subscription" | "download";
}

interface DataNeededProps {
  title: string;
  description: string;
  actions: DataAction[];
  color: string;
}

const actionIcons: Record<DataAction["type"], React.ComponentType<{ className?: string }>> = {
  api_key: Key,
  prr: FileText,
  subscription: CreditCard,
  download: Download,
};

const actionLabels: Record<DataAction["type"], string> = {
  api_key: "Free API key",
  prr: "Public records request",
  subscription: "Paid subscription",
  download: "Free download",
};

export default function DataNeeded({ title, description, actions, color }: DataNeededProps) {
  return (
    <div
      className="relative bg-[var(--color-paper-warm)] border border-[var(--color-parchment)] rounded-sm overflow-hidden"
    >
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: color, opacity: 0.5 }} />

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ backgroundColor: color, opacity: 0.12 }}
          >
            <Database className="w-4.5 h-4.5" style={{ color }} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[var(--color-ink)] leading-snug">
              {title}
            </h3>
            <p className="text-[13px] text-[var(--color-ink-muted)] leading-relaxed mt-1">
              {description}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 mt-5">
          <p className="text-[11px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em] mb-3">
            How to get this data
          </p>
          {actions.map((action, i) => {
            const Icon = actionIcons[action.type];
            const typeLabel = actionLabels[action.type];

            return (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 bg-[var(--color-parchment)]/40 border border-[var(--color-parchment)]/60 rounded-sm group"
              >
                <Icon className="w-4 h-4 text-[var(--color-ink-muted)] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[var(--color-ink-light)] leading-snug">
                    {action.label}
                  </p>
                  <p className="text-[11px] text-[var(--color-ink-muted)] mt-0.5">
                    {typeLabel}
                  </p>
                </div>
                {action.href && (
                  <a
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-medium flex items-center gap-1 flex-shrink-0 hover:underline"
                    style={{ color }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visit
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-[11px] text-[var(--color-ink-muted)]/60 mt-5 leading-relaxed">
          Portland Civic Lab is committed to transparency. We show real data when we have it and clearly mark what is missing.
          Help us fill the gaps by contributing data sources.
        </p>
      </div>
    </div>
  );
}

"use client";

import {
  type DataSourceStatus,
  getBadgeVariant,
} from "@/data/source-status";
import Badge from "@/components/ui/Badge";

interface DataSourceBadgeProps {
  status: DataSourceStatus;
  label: string;
  tooltip?: string;
}

/**
 * A small badge that shows whether a dashboard card's data is
 * live, estimated, or pending a specific action (PRR, API key, etc.).
 *
 * Place this inside or next to a HeadlineCard to indicate data provenance.
 */
export default function DataSourceBadge({
  status,
  label,
  tooltip,
}: DataSourceBadgeProps) {
  const variant = getBadgeVariant(status);

  // Pick a dot color to match the variant
  const dotColor: Record<typeof variant, string> = {
    success: "#059669",
    info: "#2563eb",
    warning: "#d97706",
    danger: "#dc2626",
    neutral: "#78716c",
  };

  return (
    <Badge variant={variant} title={tooltip}>
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: dotColor[variant] }}
      />
      {label}
    </Badge>
  );
}

export type { DataSourceBadgeProps };

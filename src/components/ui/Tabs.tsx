"use client";

import { useState, type ReactNode } from "react";
import clsx from "clsx";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export default function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id);

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab bar */}
      <div className="flex border-b border-[var(--color-parchment)] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-4 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors relative",
              tab.id === activeTab
                ? "text-[var(--color-canopy)]"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-light)]"
            )}
          >
            {tab.label}
            {tab.id === activeTab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-canopy)]" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="pt-4">{activeContent}</div>
    </div>
  );
}

export type { Tab, TabsProps };

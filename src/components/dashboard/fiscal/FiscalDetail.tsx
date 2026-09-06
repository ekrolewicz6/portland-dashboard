"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Landmark, Receipt } from "lucide-react";
import TaxDetail from "../tax/TaxDetail";
import BudgetExplorer from "./BudgetExplorer";

const FISCAL_COLOR = "#1e40af";

type Tab = "budget" | "tax";

const TABS: {
  id: Tab;
  label: string;
  shortLabel: string;
  Icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    id: "budget",
    label: "Budget Explorer",
    shortLabel: "Budget",
    Icon: Landmark,
    description:
      "Where the General Fund goes, how it's funded, and what happens if we cut.",
  },
  {
    id: "tax",
    label: "Tax Comparison",
    shortLabel: "Taxes",
    Icon: Receipt,
    description:
      "Portland's full local fiscal basket from FiSC, plus an income-tax-only calculator across income levels.",
  },
];

function tabFromHash(hash: string): Tab {
  const id = hash.replace(/^#/, "");
  return id === "tax" || id === "budget" ? id : "budget";
}

export default function FiscalDetail() {
  const [activeTab, setActiveTab] = useState<Tab>("budget");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  const ActiveTab = TABS.find((t) => t.id === activeTab)!;

  const tabId = (id: Tab) => `${baseId}-tab-${id}`;
  const panelId = (id: Tab) => `${baseId}-panel-${id}`;

  useEffect(() => {
    const syncFromHash = () => setActiveTab(tabFromHash(window.location.hash));

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
    };
  }, []);

  function selectTab(tab: Tab) {
    setActiveTab(tab);
    const nextHash = `#${tab}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash);
    }
  }

  // Arrow keys move between tabs; only the selected tab is a tab stop, so Tab
  // steps past the whole strip into the panel.
  function handleTabKeys(event: React.KeyboardEvent, index: number) {
    const last = TABS.length - 1;
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = index === last ? 0 : index + 1;
        break;
      case "ArrowLeft":
        next = index === 0 ? last : index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    selectTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="space-y-8">
      {/* Tab nav */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <ActiveTab.Icon
            className="w-4 h-4 text-[#1e40af]"
          />
          <h2 className="text-[13px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-[0.15em]">
            {ActiveTab.label}
          </h2>
          <div className="flex-1 h-px bg-[var(--color-parchment)]" />
        </div>

        <div
          role="tablist"
          aria-label="Fiscal views"
          className="flex flex-wrap gap-1 mb-6"
        >
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={tabId(tab.id)}
              aria-selected={activeTab === tab.id}
              aria-controls={panelId(tab.id)}
              tabIndex={activeTab === tab.id ? 0 : -1}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              onKeyDown={(event) => handleTabKeys(event, index)}
              onClick={() => selectTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-sm text-[13px] font-medium transition-all"
              style={{
                backgroundColor:
                  activeTab === tab.id
                    ? FISCAL_COLOR
                    : "var(--color-paper-warm)",
                color:
                  activeTab === tab.id ? "white" : "var(--color-ink-muted)",
                border: `1px solid ${activeTab === tab.id ? FISCAL_COLOR : "var(--color-parchment)"}`,
              }}
            >
              <tab.Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>

        <p className="text-[13px] text-[var(--color-ink-muted)] mb-5 italic">
          {ActiveTab.description}
        </p>

        {/* Active view */}
        <div
          role="tabpanel"
          id={panelId(activeTab)}
          aria-labelledby={tabId(activeTab)}
        >
          {activeTab === "budget" && <BudgetExplorer />}
          {activeTab === "tax" && <TaxDetail />}
        </div>
      </section>
    </div>
  );
}

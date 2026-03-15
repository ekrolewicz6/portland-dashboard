"use client";

import { useState } from "react";
import { Menu, X, TreePine, BarChart3, Download, Mail } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e8e5e0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--color-forest)] rounded-lg flex items-center justify-center">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--color-forest-dark)] leading-tight">
                Portland Commons
              </h1>
              <p className="text-xs text-[var(--color-sage)] -mt-0.5 tracking-wide">
                CIVIC DASHBOARD
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <a
              href="#dashboard"
              className="px-3 py-2 text-sm font-medium text-[var(--color-slate-warm)] hover:text-[var(--color-forest)] hover:bg-[var(--color-forest)]/5 rounded-lg transition-colors"
            >
              <BarChart3 className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Dashboard
            </a>
            <a
              href="#export"
              className="px-3 py-2 text-sm font-medium text-[var(--color-slate-warm)] hover:text-[var(--color-forest)] hover:bg-[var(--color-forest)]/5 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Export
            </a>
            <a
              href="#pulse"
              className="px-3 py-2 text-sm font-medium text-white bg-[var(--color-forest)] hover:bg-[var(--color-forest-light)] rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Portland Pulse
            </a>
          </nav>

          <button
            className="md:hidden p-2 text-[var(--color-slate-warm)]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#e8e5e0] bg-white px-4 py-3 space-y-1">
          <a
            href="#dashboard"
            className="block px-3 py-2 text-sm font-medium text-[var(--color-slate-warm)] hover:bg-[var(--color-forest)]/5 rounded-lg"
          >
            Dashboard
          </a>
          <a
            href="#export"
            className="block px-3 py-2 text-sm font-medium text-[var(--color-slate-warm)] hover:bg-[var(--color-forest)]/5 rounded-lg"
          >
            Export Data
          </a>
          <a
            href="#pulse"
            className="block px-3 py-2 text-sm font-medium text-white bg-[var(--color-forest)] rounded-lg text-center"
          >
            Subscribe to Portland Pulse
          </a>
        </div>
      )}
    </header>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Download, Mail } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-canopy)] text-white">
      <div className="max-w-[1400px] 3xl:max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-14">
          {/* Logo & wordmark */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                className="transition-transform duration-300 group-hover:scale-110"
              >
                <path
                  d="M14 2L6 8v12l8 6 8-6V8l-8-6z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-[var(--color-sage)]"
                />
                <path
                  d="M14 6l-4 3v8l4 3 4-3v-8l-4-3z"
                  fill="currentColor"
                  className="text-[var(--color-ember)]"
                  opacity="0.8"
                />
                <circle cx="14" cy="14" r="2" fill="white" opacity="0.9" />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-semibold tracking-tight">
                Portland Commons
              </span>
              <span className="hidden sm:inline text-[11px] font-medium text-[var(--color-sage)] uppercase tracking-[0.15em]">
                Civic Dashboard
              </span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            <a
              href="#dashboard"
              className="px-3 py-1.5 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/8 rounded transition-all duration-200"
            >
              Dashboard
            </a>
            <a
              href="#methodology"
              className="px-3 py-1.5 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/8 rounded transition-all duration-200"
            >
              Methodology
            </a>
            <a
              href="#export"
              className="px-3 py-1.5 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/8 rounded transition-all duration-200"
            >
              <Download className="w-3.5 h-3.5 inline mr-1 -mt-[1px]" />
              Export
            </a>
            <div className="w-px h-5 bg-white/15 mx-2" />
            <a
              href="#pulse"
              className="px-3.5 py-1.5 text-[13px] font-medium text-[var(--color-canopy)] bg-[var(--color-ember)] hover:bg-[var(--color-ember-bright)] rounded transition-all duration-200"
            >
              <Mail className="w-3.5 h-3.5 inline mr-1 -mt-[1px]" />
              Portland Pulse
            </a>
          </nav>

          {/* Mobile menu */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[var(--color-canopy-mid)] px-5 py-4 space-y-1 animate-slide-down">
          <a
            href="#dashboard"
            className="block px-3 py-2 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/5 rounded"
          >
            Dashboard
          </a>
          <a
            href="#methodology"
            className="block px-3 py-2 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/5 rounded"
          >
            Methodology
          </a>
          <a
            href="#export"
            className="block px-3 py-2 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/5 rounded"
          >
            Export Data
          </a>
          <div className="pt-2">
            <a
              href="#pulse"
              className="block px-3 py-2.5 text-[13px] font-medium text-center text-[var(--color-canopy)] bg-[var(--color-ember)] rounded"
            >
              Subscribe to Portland Pulse
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

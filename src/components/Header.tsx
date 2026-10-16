import React from 'react';
import { Sun, Moon, Key } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  toggleDarkMode: () => void;
  onOpenMasModal: () => void;
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  toggleDarkMode,
  onOpenMasModal,
  activeSection,
  onSectionClick,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          SingaFX
        </a>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <button
            onClick={() => onSectionClick('calculator-section')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'calculator'
                ? 'text-neutral-900 dark:text-white font-semibold'
                : 'hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => onSectionClick('watchlist-section')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'watchlist'
                ? 'text-neutral-900 dark:text-white font-semibold'
                : 'hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Watchlist
          </button>
          <button
            onClick={() => onSectionClick('trends-section')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'trends'
                ? 'text-neutral-900 dark:text-white font-semibold'
                : 'hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Trends
          </button>
          <button
            onClick={() => onSectionClick('fees-section')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'fees'
                ? 'text-neutral-900 dark:text-white font-semibold'
                : 'hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Fees
          </button>
        </nav>

        {/* Zone 3: Dark Mode Toggle & Primary MAS API Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={toggleDarkMode}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenMasModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5" />
            <span>MAS API</span>
          </button>
        </div>
      </div>
    </header>
  );
};

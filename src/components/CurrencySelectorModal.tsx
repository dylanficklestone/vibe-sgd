import React, { useState, useMemo } from 'react';
import { Currency, CurrencyRegion } from '../types/currency';
import { Search, X, Check } from 'lucide-react';

interface CurrencySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (currency: Currency) => void;
  selectedCurrency: Currency;
  currencies: Currency[];
  title?: string;
}

const REGION_TABS: { label: string; value: 'ALL' | CurrencyRegion }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'ASEAN', value: 'ASEAN' },
  { label: 'Asia-Pacific', value: 'Asia-Pacific' },
  { label: 'Americas', value: 'Americas' },
  { label: 'Europe', value: 'Europe' },
  { label: 'Middle East', value: 'Middle East' },
];

export const CurrencySelectorModal: React.FC<CurrencySelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedCurrency,
  currencies,
  title = 'Select Currency',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState<'ALL' | CurrencyRegion>('ALL');

  const filteredCurrencies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return currencies.filter((c) => {
      const matchesSearch =
        q === '' ||
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q);

      const matchesRegion = activeRegion === 'ALL' || c.region === activeRegion;
      return matchesSearch && matchesRegion;
    });
  }, [currencies, searchQuery, activeRegion]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {title}
            </h3>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              <span>Benchmark vs SGD</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>{currencies.length} currencies</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800/60">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, country or currency (e.g. MYR, Malaysia, Yen)..."
              autoFocus
              className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800/80 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden transition-all"
            />
          </div>

          {/* Region Tabs (Interactive Filter Control Buttons) */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto no-scrollbar pb-0.5">
            {REGION_TABS.map((tab) => {
              const active = activeRegion === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveRegion(tab.value)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Currency List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60 p-2">
          {filteredCurrencies.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
              No currencies match your search query.
            </div>
          ) : (
            filteredCurrencies.map((c) => {
              const isSelected = c.code === selectedCurrency.code;
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    onSelect(c);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800/70'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl select-none" role="img" aria-label={c.country}>
                      {c.flag}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {c.code}
                        </span>
                        <span className="text-xs text-neutral-400 dark:text-neutral-500">
                          {c.symbol}
                        </span>
                        {c.code === 'SGD' && (
                          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            Base
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {c.name} · {c.country}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="text-sm font-mono tabular-nums font-medium text-neutral-900 dark:text-neutral-100">
                        {c.code === 'SGD'
                          ? '1.0000'
                          : c.masQuoteUnit === 100
                          ? `${(c.rateAgainstSgd / 100).toFixed(4)}`
                          : c.rateAgainstSgd.toFixed(c.decimals > 2 ? 4 : 2)}
                      </div>
                      <div
                        className={`text-xs font-mono tabular-nums ${
                          c.change24h > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : c.change24h < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-neutral-400'
                        }`}
                      >
                        {c.change24h > 0 ? `+${c.change24h}%` : `${c.change24h}%`}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

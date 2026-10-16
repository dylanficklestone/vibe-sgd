import React, { useState, useMemo } from 'react';
import { Currency, CurrencyRegion } from '../types/currency';
import { Search, ArrowRight, TrendingUp, TrendingDown, Star } from 'lucide-react';

interface RateWatchlistProps {
  currencies: Currency[];
  baseAmount: number;
  baseCurrency: Currency;
  onSelectTarget: (currency: Currency) => void;
}

export const RateWatchlist: React.FC<RateWatchlistProps> = ({
  currencies,
  baseAmount,
  baseCurrency,
  onSelectTarget,
}) => {
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState<'ALL' | CurrencyRegion>('ALL');
  const [pinnedCodes, setPinnedCodes] = useState<string[]>(['MYR', 'USD', 'JPY', 'THB', 'EUR']);

  const togglePin = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = currencies.filter((c) => {
      if (c.code === baseCurrency.code) return false;
      const matchesSearch =
        q === '' ||
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q);
      const matchesRegion = filterRegion === 'ALL' || c.region === filterRegion;
      return matchesSearch && matchesRegion;
    });

    // Pinned currencies on top
    return list.sort((a, b) => {
      const aPinned = pinnedCodes.includes(a.code);
      const bPinned = pinnedCodes.includes(b.code);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }, [currencies, baseCurrency, search, filterRegion, pinnedCodes]);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            <span>Real-Time Multi-Currency Matrix</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Based on {baseCurrency.symbol}{baseAmount.toLocaleString()} {baseCurrency.code}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-0.5">
            Exchange Rate Watchlist
          </h2>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search currencies..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden transition-all"
          />
        </div>
      </div>

      {/* Region Filter Buttons */}
      <div className="flex items-center gap-1.5 py-4 overflow-x-auto no-scrollbar">
        {(['ALL', 'ASEAN', 'Asia-Pacific', 'Americas', 'Europe', 'Middle East'] as const).map(
          (reg) => {
            const active = filterRegion === reg;
            return (
              <button
                key={reg}
                onClick={() => setFilterRegion(reg)}
                className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {reg === 'ALL' ? 'All Currencies' : reg}
              </button>
            );
          }
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              <th className="py-2.5 px-3">Currency</th>
              <th className="py-2.5 px-3 text-right">1 {baseCurrency.code} Rate</th>
              <th className="py-2.5 px-3 text-right">
                Converted ({baseCurrency.symbol}{baseAmount.toLocaleString()})
              </th>
              <th className="py-2.5 px-3 text-right">24h Change</th>
              <th className="py-2.5 px-3 text-right">MAS Standard</th>
              <th className="py-2.5 px-3 text-center w-12">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-sm">
            {filteredList.map((c) => {
              // Cross rate against baseCurrency
              const crossRate =
                (1 / baseCurrency.rateAgainstSgd) * c.rateAgainstSgd;
              const convertedValue = baseAmount * crossRate;
              const isPinned = pinnedCodes.includes(c.code);

              // MAS quote convention
              const masQuote =
                c.masQuoteUnit === 100
                  ? `S$${(100 / c.rateAgainstSgd).toFixed(4)} / 100`
                  : `S$${(1 / c.rateAgainstSgd).toFixed(4)} / 1`;

              return (
                <tr
                  key={c.code}
                  onClick={() => onSelectTarget(c)}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer group"
                >
                  {/* Currency Column */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={(e) => togglePin(c.code, e)}
                        className={`p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ${
                          isPinned
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-neutral-300 dark:text-neutral-600'
                        }`}
                        title={isPinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
                      </button>
                      <span className="text-xl select-none" role="img" aria-label={c.country}>
                        {c.flag}
                      </span>
                      <div>
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                          <span>{c.code}</span>
                          <span className="text-xs font-normal text-neutral-400">
                            {c.symbol}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[140px] sm:max-w-none">
                          {c.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 1 Base Rate Column */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-neutral-900 dark:text-neutral-100">
                    {crossRate.toFixed(c.decimals > 2 ? 4 : 2)}
                  </td>

                  {/* Converted Amount Column */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-neutral-900 dark:text-neutral-100">
                    {c.symbol}
                    {convertedValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: c.decimals > 2 ? 4 : 2,
                    })}
                  </td>

                  {/* 24h Change */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-xs">
                    <span
                      className={`inline-flex items-center gap-0.5 ${
                        c.change24h > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : c.change24h < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-neutral-400'
                      }`}
                    >
                      {c.change24h > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : c.change24h < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : null}
                      {c.change24h > 0 ? `+${c.change24h}%` : `${c.change24h}%`}
                    </span>
                  </td>

                  {/* MAS Reference Standard */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-xs text-neutral-500 dark:text-neutral-400">
                    {masQuote}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onSelectTarget(c)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800 transition-colors"
                      title="Load in calculator"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

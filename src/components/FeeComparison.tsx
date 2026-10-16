import React from 'react';
import { Currency } from '../types/currency';
import { SINGAPORE_FEE_STRUCTURES } from '../data/currencies';
import { Landmark, CreditCard, Banknote, Building2 } from 'lucide-react';

interface FeeComparisonProps {
  amount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
}

export const FeeComparison: React.FC<FeeComparisonProps> = ({
  amount,
  fromCurrency,
  toCurrency,
}) => {
  // Cross rate calculation
  const rawCrossRate =
    fromCurrency.code === toCurrency.code
      ? 1.0
      : (1 / fromCurrency.rateAgainstSgd) * toCurrency.rateAgainstSgd;

  const grossToAmount = amount * rawCrossRate;

  const getIcon = (type: string) => {
    switch (type) {
      case 'interbank':
        return <Landmark className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />;
      case 'fintech':
        return <CreditCard className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />;
      case 'money_changer':
        return <Banknote className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />;
      case 'bank':
      default:
        return <Building2 className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />;
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
      {/* Header */}
      <div className="pb-5 border-b border-neutral-100 dark:border-neutral-800">
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          <span>Singapore Money Changer & Bank Provider Analysis</span>
          <span className="mx-1.5" aria-hidden="true">·</span>
          <span>{fromCurrency.symbol}{amount.toLocaleString()} {fromCurrency.code} → {toCurrency.code}</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-0.5">
          Provider & Fee Comparison
        </h3>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {SINGAPORE_FEE_STRUCTURES.map((fee) => {
          const effectiveRate = rawCrossRate * (1 - fee.spreadPercent / 100);
          const netReceived = grossToAmount * (1 - fee.spreadPercent / 100);
          const costLossInTarget = grossToAmount - netReceived;
          const costLossInSgd = costLossInTarget / toCurrency.rateAgainstSgd;

          return (
            <div
              key={fee.id}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    {getIcon(fee.providerType)}
                  </div>
                  <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 leading-tight">
                    {fee.name.split('(')[0]}
                  </div>
                </div>

                <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 min-h-[32px]">
                  {fee.description}
                </div>

                <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                  <div className="text-[11px] text-neutral-400">You Receive</div>
                  <div className="text-lg font-mono tabular-nums font-bold text-neutral-900 dark:text-neutral-100">
                    {toCurrency.symbol}
                    {netReceived.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: toCurrency.decimals > 2 ? 4 : 2,
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-700/60 space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                  <span>Exchange Rate:</span>
                  <span className="font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                    {effectiveRate.toFixed(toCurrency.decimals > 2 ? 4 : 2)}
                  </span>
                </div>

                <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                  <span>Markup Fee:</span>
                  <span className="font-mono tabular-nums font-medium text-neutral-900 dark:text-neutral-100">
                    {fee.spreadPercent === 0 ? '0.00% (Baseline)' : `~S$${costLossInSgd.toFixed(2)} (${fee.spreadPercent}%)`}
                  </span>
                </div>

                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1 italic">
                  Best for: {fee.recommendedFor}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

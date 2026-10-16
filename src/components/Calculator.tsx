import React, { useState, useMemo, useCallback } from 'react';
import { Currency, FeeStructure } from '../types/currency';
import { SINGAPORE_FEE_STRUCTURES } from '../data/currencies';
import {
  ArrowUpDown,
  ChevronDown,
  Copy,
  Check,
  Calculator as CalcIcon,
  RotateCcw,
  Delete,
  Info,
} from 'lucide-react';

interface CalculatorProps {
  currencies: Currency[];
  fromCurrency: Currency;
  toCurrency: Currency;
  onFromCurrencyChange: (c: Currency) => void;
  onToCurrencyChange: (c: Currency) => void;
  onOpenSelector: (target: 'from' | 'to') => void;
  amount: number;
  onAmountChange: (amount: number) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({
  currencies: _currencies,
  fromCurrency,
  toCurrency,
  onFromCurrencyChange,
  onToCurrencyChange,
  onOpenSelector,
  amount,
  onAmountChange,
}) => {
  const [expression, setExpression] = useState<string>(amount.toString());
  const [showKeypad, setShowKeypad] = useState<boolean>(false);
  const [selectedFee, setSelectedFee] = useState<FeeStructure>(SINGAPORE_FEE_STRUCTURES[0]);
  const [copied, setCopied] = useState<boolean>(false);

  // Evaluate arithmetic expression safely (supports numbers and + - * /)
  const evaluatedAmount = useMemo(() => {
    try {
      const sanitized = expression.replace(/[^0-9.+\-*/()]/g, '');
      if (!sanitized) return 0;
      // Basic safe evaluator for + - * /
      const fn = new Function(`return (${sanitized})`);
      const val = Number(fn());
      return isNaN(val) || !isFinite(val) || val < 0 ? 0 : val;
    } catch {
      return amount;
    }
  }, [expression, amount]);

  // Sync evaluated value upwards
  const handleExpressionChange = (val: string) => {
    setExpression(val);
    try {
      const sanitized = val.replace(/[^0-9.+\-*/()]/g, '');
      if (sanitized) {
        const fn = new Function(`return (${sanitized})`);
        const num = Number(fn());
        if (!isNaN(num) && isFinite(num) && num >= 0) {
          onAmountChange(num);
        }
      }
    } catch {
      // typing intermediate expression
    }
  };

  // Preset denominations
  const presets = [50, 100, 500, 1000, 5000, 10000];

  // Exchange rate math
  // Rate against SGD: 1 SGD = currency.rateAgainstSgd
  // Conversion:
  // If fromCurrency is SGD: toAmount = amount * toCurrency.rateAgainstSgd
  // If toCurrency is SGD: toAmount = amount / fromCurrency.rateAgainstSgd
  // Cross-rate: toAmount = (amount / fromCurrency.rateAgainstSgd) * toCurrency.rateAgainstSgd
  const crossRate = useMemo(() => {
    if (fromCurrency.code === toCurrency.code) return 1.0;
    const fromInSgd = 1 / fromCurrency.rateAgainstSgd;
    return fromInSgd * toCurrency.rateAgainstSgd;
  }, [fromCurrency, toCurrency]);

  const inverseCrossRate = useMemo(() => {
    return crossRate > 0 ? 1 / crossRate : 0;
  }, [crossRate]);

  // Fee calculation
  const grossConverted = evaluatedAmount * crossRate;
  const spreadMultiplier = 1 - selectedFee.spreadPercent / 100;
  const netConverted = grossConverted * spreadMultiplier;
  const feeCostInTargetCurrency = grossConverted - netConverted;
  const feeCostInSgd = feeCostInTargetCurrency / toCurrency.rateAgainstSgd;

  // Swap currencies
  const handleSwap = useCallback(() => {
    const temp = fromCurrency;
    onFromCurrencyChange(toCurrency);
    onToCurrencyChange(temp);
  }, [fromCurrency, toCurrency, onFromCurrencyChange, onToCurrencyChange]);

  // Keypad actions
  const handleKeypadPress = (key: string) => {
    if (key === 'C') {
      setExpression('0');
      onAmountChange(0);
    } else if (key === '⌫') {
      const next = expression.length > 1 ? expression.slice(0, -1) : '0';
      handleExpressionChange(next);
    } else if (key === '=') {
      setExpression(evaluatedAmount.toString());
      onAmountChange(evaluatedAmount);
    } else {
      const next = expression === '0' && key !== '.' ? key : expression + key;
      handleExpressionChange(next);
    }
  };

  const handleCopy = () => {
    const textToCopy = `${netConverted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: toCurrency.decimals > 2 ? 4 : 2,
    })} ${toCurrency.code}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // MAS Reference representation
  const masQuotationText = useMemo(() => {
    const target = toCurrency.code === 'SGD' ? fromCurrency : toCurrency;
    if (target.code === 'SGD') return null;
    const isPer100 = target.masQuoteUnit === 100;
    const sgdCost = isPer100
      ? (100 / target.rateAgainstSgd).toFixed(4)
      : (1 / target.rateAgainstSgd).toFixed(4);

    return isPer100
      ? `MAS Reference Standard: S$${sgdCost} per 100 ${target.code}`
      : `MAS Reference Standard: S$${sgdCost} per 1 ${target.code}`;
  }, [fromCurrency, toCurrency]);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
      {/* Top Header & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            <span>Singapore Dollar FX Engine</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Live Interbank Mid-Market</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-0.5">
            Currency Calculator
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeypad(!showKeypad)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              showKeypad
                ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white'
                : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'
            }`}
          >
            <CalcIcon className="w-3.5 h-3.5" />
            <span>Keypad</span>
          </button>

          <button
            onClick={() => {
              setExpression('1000');
              onAmountChange(1000);
            }}
            title="Reset to 1,000"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Conversion Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-4 py-6">
        {/* FROM Currency Box */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              You Convert
            </span>
            <button
              onClick={() => onOpenSelector('from')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
            >
              <span className="text-base select-none">{fromCurrency.flag}</span>
              <span>{fromCurrency.code}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>

          <div className="relative mt-2">
            <input
              type="text"
              value={expression}
              onChange={(e) => handleExpressionChange(e.target.value)}
              placeholder="0.00"
              className="w-full text-3xl font-mono tabular-nums font-bold bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 truncate">
              {fromCurrency.name} ({fromCurrency.country})
            </div>
          </div>
        </div>

        {/* Center Swap Button */}
        <div className="flex justify-center my-[-8px] lg:my-0">
          <button
            onClick={handleSwap}
            className="p-3 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 shadow-xs hover:rotate-180 transition-all duration-300"
            aria-label="Swap currencies"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* TO Currency Box */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              You Receive (Estimated)
            </span>
            <button
              onClick={() => onOpenSelector('to')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
            >
              <span className="text-base select-none">{toCurrency.flag}</span>
              <span>{toCurrency.code}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>

          <div className="relative mt-2 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-mono tabular-nums font-bold text-neutral-900 dark:text-neutral-100">
                {netConverted.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: toCurrency.decimals > 2 ? 4 : 2,
                })}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 truncate">
                {toCurrency.name} ({toCurrency.country})
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-white dark:hover:bg-neutral-800 transition-colors"
              title="Copy result"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Amount Presets */}
      <div className="flex items-center gap-2 flex-wrap pt-1 pb-4">
        <span className="text-xs text-neutral-500 dark:text-neutral-400 mr-1">
          Quick {fromCurrency.symbol}:
        </span>
        {presets.map((val) => (
          <button
            key={val}
            onClick={() => {
              setExpression(val.toString());
              onAmountChange(val);
            }}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            {fromCurrency.symbol}
            {val.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Keypad Drawer (Minimalist & Tactile) */}
      {showKeypad && (
        <div className="mt-2 mb-5 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-3 text-xs text-neutral-500 dark:text-neutral-400">
            <span>Minimalist Calculator Keypad</span>
            <span>Supports direct keyboard entry (+, -, *, /)</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              '7', '8', '9', '/',
              '4', '5', '6', '*',
              '1', '2', '3', '-',
              '0', '.', '⌫', '+',
              'C', '=',
            ].map((k) => {
              const isOp = ['/', '*', '-', '+', '='].includes(k);
              const isClear = k === 'C' || k === '⌫';
              return (
                <button
                  key={k}
                  onClick={() => handleKeypadPress(k)}
                  className={`py-2.5 text-sm font-mono font-semibold rounded-lg transition-all active:scale-95 ${
                    k === '='
                      ? 'col-span-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : isOp
                      ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                      : isClear
                      ? 'bg-neutral-200/80 dark:bg-neutral-700/80 text-rose-600 dark:text-rose-400 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                      : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750'
                  }`}
                >
                  {k === '⌫' ? <Delete className="w-4 h-4 mx-auto" /> : k}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Rate Breakdown & MAS Reference Details */}
      <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
              1 {fromCurrency.code} = {crossRate.toFixed(toCurrency.decimals > 2 ? 4 : 2)} {toCurrency.code}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">
              1 {toCurrency.code} = {inverseCrossRate.toFixed(fromCurrency.decimals > 2 ? 4 : 2)} {fromCurrency.code}
            </span>
          </div>

          {masQuotationText && (
            <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
              <Info className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
              <span>{masQuotationText}</span>
            </div>
          )}
        </div>

        {/* Fee / Rate Channel Selector */}
        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Singapore Exchange Channel:
            </span>
            <span className="text-neutral-500 font-mono">
              Spread Markup: {selectedFee.spreadPercent}% (~S${feeCostInSgd.toFixed(2)})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {SINGAPORE_FEE_STRUCTURES.map((fee) => {
              const active = selectedFee.id === fee.id;
              return (
                <button
                  key={fee.id}
                  onClick={() => setSelectedFee(fee)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    active
                      ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="text-xs font-semibold leading-tight">{fee.name}</div>
                  <div className={`text-[11px] font-mono mt-1 ${active ? 'opacity-90' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    {fee.spreadPercent === 0 ? '0% Markup (Benchmark)' : `+${fee.spreadPercent}% FX markup`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

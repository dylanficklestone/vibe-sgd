import React, { useState, useMemo } from 'react';
import { Currency, TimeRange, HistoricalRatePoint } from '../types/currency';
import { generateHistoricalRates } from '../data/currencies';
import { TrendingUp, TrendingDown, Clock, ShieldCheck } from 'lucide-react';

interface HistoricalTrendProps {
  currency: Currency;
}

const RANGES: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y'];

export const HistoricalTrend: React.FC<HistoricalTrendProps> = ({ currency }) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const [hoveredPoint, setHoveredPoint] = useState<HistoricalRatePoint | null>(null);

  const data = useMemo(() => {
    return generateHistoricalRates(currency, selectedRange);
  }, [currency, selectedRange]);

  const { minRate, maxRate, avgRate, rateChange, percentChange } = useMemo(() => {
    if (data.length === 0) {
      return { minRate: 0, maxRate: 0, avgRate: 0, rateChange: 0, percentChange: 0 };
    }
    const rates = data.map((d) => d.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const sum = rates.reduce((acc, val) => acc + val, 0);
    const avg = sum / rates.length;
    const first = data[0].rate;
    const last = data[data.length - 1].rate;
    const diff = last - first;
    const pct = first > 0 ? (diff / first) * 100 : 0;
    return {
      minRate: min,
      maxRate: max,
      avgRate: avg,
      rateChange: diff,
      percentChange: pct,
    };
  }, [data]);

  // SVG Chart Geometry
  const width = 640;
  const height = 180;
  const paddingX = 20;
  const paddingY = 24;

  const points = useMemo(() => {
    if (data.length <= 1) return '';
    const span = maxRate - minRate || 1;
    return data
      .map((d, i) => {
        const x = paddingX + (i / (data.length - 1)) * (width - 2 * paddingX);
        const y = height - paddingY - ((d.rate - minRate) / span) * (height - 2 * paddingY);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [data, minRate, maxRate]);

  const areaPoints = useMemo(() => {
    if (data.length <= 1) return '';
    const span = maxRate - minRate || 1;
    const firstX = paddingX;
    const lastX = width - paddingX;
    const bottomY = height - paddingY;
    const lineParts = data
      .map((d, i) => {
        const x = paddingX + (i / (data.length - 1)) * (width - 2 * paddingX);
        const y = height - paddingY - ((d.rate - minRate) / span) * (height - 2 * paddingY);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' L ');

    return `M ${firstX},${bottomY} L ${lineParts} L ${lastX},${bottomY} Z`;
  }, [data, minRate, maxRate]);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
      {/* Header & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            <span>Historical Rate Analytics</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>SGD / {currency.code}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              SGD to {currency.code} Performance
            </h3>
            <span
              className={`text-xs font-mono tabular-nums font-semibold flex items-center gap-0.5 ${
                percentChange >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {percentChange >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {percentChange >= 0 ? `+${percentChange.toFixed(2)}%` : `${percentChange.toFixed(2)}%`}
            </span>
          </div>
        </div>

        {/* Range Selector Buttons */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          {RANGES.map((rng) => {
            const active = selectedRange === rng;
            return (
              <button
                key={rng}
                onClick={() => setSelectedRange(rng)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  active
                    ? 'bg-white text-neutral-900 dark:bg-neutral-700 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {rng}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative py-4">
        {/* Hover Rate Indicator */}
        <div className="h-6 flex items-center justify-between text-xs mb-2">
          {hoveredPoint ? (
            <div className="font-mono text-neutral-900 dark:text-neutral-100">
              <span className="text-neutral-400 mr-2">{hoveredPoint.date}:</span>
              <span className="font-bold">
                1 SGD = {hoveredPoint.rate} {currency.code}
              </span>
            </div>
          ) : (
            <div className="text-neutral-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Hover over chart for historical quotes</span>
            </div>
          )}

          <div className="text-neutral-400 font-mono text-[11px]">
            Range: {minRate.toFixed(currency.decimals > 2 ? 4 : 2)} — {maxRate.toFixed(currency.decimals > 2 ? 4 : 2)}
          </div>
        </div>

        {/* SVG Viewport */}
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-44 overflow-visible"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" className="text-neutral-900 dark:text-white" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" className="text-neutral-900 dark:text-white" />
              </linearGradient>
            </defs>

            {/* Hairline Gridlines */}
            <line
              x1={paddingX}
              y1={paddingY}
              x2={width - paddingX}
              y2={paddingY}
              stroke="currentColor"
              className="text-neutral-100 dark:text-neutral-800"
              strokeDasharray="3 3"
            />
            <line
              x1={paddingX}
              y1={height / 2}
              x2={width - paddingX}
              y2={height / 2}
              stroke="currentColor"
              className="text-neutral-100 dark:text-neutral-800"
              strokeDasharray="3 3"
            />
            <line
              x1={paddingX}
              y1={height - paddingY}
              x2={width - paddingX}
              y2={height - paddingY}
              stroke="currentColor"
              className="text-neutral-200 dark:text-neutral-800"
            />

            {/* Shaded Area */}
            {areaPoints && (
              <path
                d={areaPoints}
                fill="url(#chartGradient)"
              />
            )}

            {/* Main Trend Line */}
            {points && (
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-neutral-900 dark:text-neutral-100"
                points={points}
              />
            )}

            {/* Interactive invisible hover hitboxes */}
            {data.map((d, i) => {
              const span = maxRate - minRate || 1;
              const x = paddingX + (i / (data.length - 1)) * (width - 2 * paddingX);
              const y = height - paddingY - ((d.rate - minRate) / span) * (height - 2 * paddingY);
              const isHovered = hoveredPoint?.date === d.date;

              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 4 : 2}
                    className={`${
                      isHovered
                        ? 'fill-neutral-900 dark:fill-white stroke-2 stroke-white dark:stroke-neutral-900'
                        : 'fill-transparent hover:fill-neutral-400'
                    } transition-all`}
                  />
                  <rect
                    x={x - 10}
                    y={0}
                    width={20}
                    height={height}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(d)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
        <div>
          <div className="text-neutral-400 dark:text-neutral-500">Period Low</div>
          <div className="font-mono tabular-nums font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
            {minRate.toFixed(currency.decimals > 2 ? 4 : 2)}
          </div>
        </div>

        <div>
          <div className="text-neutral-400 dark:text-neutral-500">Period High</div>
          <div className="font-mono tabular-nums font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
            {maxRate.toFixed(currency.decimals > 2 ? 4 : 2)}
          </div>
        </div>

        <div>
          <div className="text-neutral-400 dark:text-neutral-500">Period Average</div>
          <div className="font-mono tabular-nums font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
            {avgRate.toFixed(currency.decimals > 2 ? 4 : 2)}
          </div>
        </div>

        <div>
          <div className="text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-neutral-400" />
            <span>MAS Benchmark</span>
          </div>
          <div className="font-mono tabular-nums font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
            {currency.masQuoteUnit === 100
              ? `S$${(100 / currency.rateAgainstSgd).toFixed(4)}/100`
              : `S$${(1 / currency.rateAgainstSgd).toFixed(4)}/1`}
          </div>
        </div>
      </div>
    </div>
  );
};

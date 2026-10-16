import { useState } from 'react';
import { CURRENCIES } from './data/currencies';
import { Currency } from './types/currency';
import { useDarkMode } from './hooks/useDarkMode';
import { Header } from './components/Header';
import { Calculator } from './components/Calculator';
import { RateWatchlist } from './components/RateWatchlist';
import { HistoricalTrend } from './components/HistoricalTrend';
import { FeeComparison } from './components/FeeComparison';
import { CurrencySelectorModal } from './components/CurrencySelectorModal';
import { MasApiModal } from './components/MasApiModal';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function App() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const [currencies] = useState<Currency[]>(CURRENCIES);

  // Default pairs: SGD to MYR (Singapore's most popular daily cross pair)
  const [fromCurrency, setFromCurrency] = useState<Currency>(() => CURRENCIES[0]); // SGD
  const [toCurrency, setToCurrency] = useState<Currency>(() => CURRENCIES[1]); // MYR
  const [amount, setAmount] = useState<number>(1000);

  // Modals state
  const [selectorTarget, setSelectorTarget] = useState<'from' | 'to' | null>(null);
  const [isMasModalOpen, setIsMasModalOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('calculator');

  const handleOpenSelector = (target: 'from' | 'to') => {
    setSelectorTarget(target);
  };

  const handleSelectCurrency = (selected: Currency) => {
    if (selectorTarget === 'from') {
      setFromCurrency(selected);
    } else if (selectorTarget === 'to') {
      setToCurrency(selected);
    }
    setSelectorTarget(null);
  };

  const handleQuickPairSelect = (targetCode: string) => {
    const target = currencies.find((c) => c.code === targetCode);
    if (target) {
      setFromCurrency(currencies[0]); // SGD
      setToCurrency(target);
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id.replace('-section', ''));
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      {/* 3-Zone Navigation Header */}
      <Header
        isDark={isDark}
        toggleDarkMode={toggleDarkMode}
        onOpenMasModal={() => setIsMasModalOpen(true)}
        activeSection={activeSection}
        onSectionClick={scrollToSection}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Editorial Hero Header */}
        <div className="space-y-3 pt-2">
          {/* Unboxed Metadata Strip (Zero-Pill Compliance) */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Republic of Singapore
            </span>
            <span aria-hidden="true">·</span>
            <span>Monetary Authority of Singapore (MAS) Framework</span>
            <span aria-hidden="true">·</span>
            <span>Real-Time SGD Benchmark</span>
            <span aria-hidden="true">·</span>
            <span>End-of-Day Calibration</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 max-w-3xl"
            style={{ textWrap: 'balance' }}
          >
            Singapore Dollar Real-Time Exchange Rate & Calculator
          </h1>

          <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Convert Singapore Dollar (SGD) against global currencies with real interbank rates,
            authentic MAS quotation conventions, and money changer fee comparisons.
          </p>

          {/* Quick Regional Currency Jump Controls */}
          <div className="flex items-center gap-2 pt-2 flex-wrap text-xs">
            <span className="text-neutral-400 dark:text-neutral-500 font-medium">
              Popular SGD Pairs:
            </span>
            {['MYR', 'USD', 'JPY', 'THB', 'IDR', 'EUR', 'CNY', 'AUD', 'GBP'].map((code) => {
              const active = toCurrency.code === code && fromCurrency.code === 'SGD';
              const curr = currencies.find((c) => c.code === code);
              return (
                <button
                  key={code}
                  onClick={() => handleQuickPairSelect(code)}
                  className={`px-2.5 py-1 rounded-md font-mono text-xs font-semibold transition-all ${
                    active
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <span className="mr-1 select-none">{curr?.flag}</span>
                  SGD/{code}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 1: Minimalist Calculator */}
        <section id="calculator-section" className="scroll-mt-20">
          <Calculator
            currencies={currencies}
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
            onFromCurrencyChange={setFromCurrency}
            onToCurrencyChange={setToCurrency}
            onOpenSelector={handleOpenSelector}
            amount={amount}
            onAmountChange={setAmount}
          />
        </section>

        {/* Section 2: Historical Trend & Performance */}
        <section id="trends-section" className="scroll-mt-20">
          <HistoricalTrend currency={toCurrency.code === 'SGD' ? fromCurrency : toCurrency} />
        </section>

        {/* Section 3: Fee & Provider Comparison */}
        <section id="fees-section" className="scroll-mt-20">
          <FeeComparison
            amount={amount}
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
          />
        </section>

        {/* Section 4: Live Watchlist Matrix */}
        <section id="watchlist-section" className="scroll-mt-20">
          <RateWatchlist
            currencies={currencies}
            baseAmount={amount}
            baseCurrency={fromCurrency}
            onSelectTarget={(target) => {
              setToCurrency(target);
              scrollToSection('calculator-section');
            }}
          />
        </section>

        {/* MAS API Integration Notice Banner */}
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Backend MAS API Integration Ready</span>
              </span>
              <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">·</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Dataset ID: 95932927-c4bc-4753-b039-de3d7f47be44
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl">
              This frontend is structured to ingest the official Monetary Authority of Singapore
              End-of-Day exchange rate JSON schemas. Plug in your MAS API Key anytime or test the schema preview.
            </p>
          </div>

          <button
            onClick={() => setIsMasModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>Configure MAS Key</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-8 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">SingaFX</span>
            <span aria-hidden="true">·</span>
            <span>Singapore Exchange Rate Engine</span>
            <span aria-hidden="true">·</span>
            <span>Calibrated against MAS Reference Benchmarks</span>
          </div>

          <div className="flex items-center gap-4">
            <span>SGT (UTC+8)</span>
            <button
              onClick={() => setIsMasModalOpen(true)}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              MAS API Documentation
            </button>
          </div>
        </div>
      </footer>

      {/* Currency Selector Modal */}
      <CurrencySelectorModal
        isOpen={selectorTarget !== null}
        onClose={() => setSelectorTarget(null)}
        onSelect={handleSelectCurrency}
        selectedCurrency={selectorTarget === 'from' ? fromCurrency : toCurrency}
        currencies={currencies}
        title={selectorTarget === 'from' ? 'Select Base Currency' : 'Select Target Currency'}
      />

      {/* MAS API Configuration & Integration Modal */}
      <MasApiModal
        isOpen={isMasModalOpen}
        onClose={() => setIsMasModalOpen(false)}
      />
    </div>
  );
}

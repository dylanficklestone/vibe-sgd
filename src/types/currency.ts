export type CurrencyRegion = 'ASEAN' | 'Asia-Pacific' | 'Americas' | 'Europe' | 'Middle East';

export interface Currency {
  code: string;
  name: string;
  country: string;
  symbol: string;
  flag: string;
  /** Units of foreign currency per 1 SGD (1 SGD = rateAgainstSgd units) */
  rateAgainstSgd: number;
  /** 24h percentage change */
  change24h: number;
  /** 24h high/low rates */
  high24h: number;
  low24h: number;
  /** MAS statistical release standard: 1 or 100 units */
  masQuoteUnit: 1 | 100;
  /** Schema identifier in MAS API datasets (e.g., usd_sgd, myr_sgd_100) */
  masField: string;
  region: CurrencyRegion;
  decimals: number;
  popular?: boolean;
}

export interface HistoricalRatePoint {
  date: string;
  rate: number;
}

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y';

export interface FeeStructure {
  id: string;
  name: string;
  providerType: 'interbank' | 'fintech' | 'money_changer' | 'bank';
  spreadPercent: number;
  fixedFeeSgd: number;
  description: string;
  recommendedFor: string;
}

export interface MasApiConfig {
  apiKey: string;
  datasetId: string;
  environment: 'simulation' | 'mas_sandbox' | 'live';
  lastSynced: string | null;
  cacheExpirySeconds: number;
}

export interface ConversionResult {
  fromCurrency: Currency;
  toCurrency: Currency;
  fromAmount: number;
  toAmount: number;
  effectiveRate: number;
  inverseRate: number;
  feeAmount: number;
  netReceived: number;
  selectedFee: FeeStructure;
}

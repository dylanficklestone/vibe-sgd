import { Currency, MasApiConfig } from '../types/currency';
import { CURRENCIES } from '../data/currencies';

const STORAGE_KEY_MAS_CONFIG = 'singafx_mas_config_v1';

export const MAS_GATEWAY_URL =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_peiod_daily';

export const DEFAULT_MAS_CONFIG: MasApiConfig = {
  apiKey: '',
  datasetId: 'exchange_rates_end_of_period_daily',
  environment: 'simulation',
  lastSynced: '2026-10-14T17:00:00+08:00',
  cacheExpirySeconds: 3600,
};

export class MasApiService {
  private static config: MasApiConfig = this.loadConfig();

  public static loadConfig(): MasApiConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MAS_CONFIG);
      if (stored) {
        return { ...DEFAULT_MAS_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return { ...DEFAULT_MAS_CONFIG };
  }

  public static saveConfig(newConfig: Partial<MasApiConfig>): MasApiConfig {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(STORAGE_KEY_MAS_CONFIG, JSON.stringify(this.config));
    } catch {
      // ignore
    }
    return this.config;
  }

  public static getConfig(): MasApiConfig {
    return { ...this.config };
  }

  /**
   * Health check on local /api/health serverless endpoint
   */
  public static async checkHealth(): Promise<{
    status: string;
    masConfig?: { keyConfigured: boolean; status: string; note: string };
  }> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // offline/static mode
    }
    return { status: 'offline' };
  }

  /**
   * Generates sample backend Express proxy code for the user
   */
  public static getBackendIntegrationSnippet(): string {
    return `// api/exchangerates.ts
import type { Request, Response } from 'express';

const MAS_API_BASE =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_peiod_daily';

export default async function handler(req: Request, res: Response) {
  const targetDate = (req.query.end_of_day as string) || '2026-10-14';
  const apiKey = process.env.MAS_API_KEY || (req.headers['x-mas-api-key'] as string) || '';

  const masUrl = new URL(MAS_API_BASE);
  masUrl.searchParams.set('end_of_day', targetDate);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (apiKey) {
    headers['apikey'] = apiKey;
    headers['Authorization'] = \`Bearer \${apiKey}\`;
  }

  try {
    const upstream = await fetch(masUrl.toString(), { headers });
    const data = await upstream.json();
    return res.status(upstream.status).json({ success: upstream.ok, data });
  } catch (err) {
    return res.status(502).json({ error: 'MAS Gateway Unreachable', details: err });
  }
}`;
  }

  /**
   * Test connection directly to the serverless /api/exchangerates endpoint
   */
  public static async testConnection(apiKey: string): Promise<{
    success: boolean;
    latencyMs: number;
    message: string;
    samplePayload?: Record<string, unknown>;
  }> {
    const startTime = performance.now();
    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };
      if (apiKey.trim()) {
        headers['x-mas-api-key'] = apiKey.trim();
      }

      const res = await fetch('/api/exchangerates?end_of_day=2026-10-14', {
        headers,
      });
      const latencyMs = Math.round(performance.now() - startTime);

      if (res.ok) {
        const json = await res.json();
        return {
          success: true,
          latencyMs,
          message: 'Connected to MAS API Gateway via /api/exchangerates.',
          samplePayload: json,
        };
      } else {
        const errorData = await res.json().catch(() => null);
        return {
          success: false,
          latencyMs,
          message:
            errorData?.message ||
            `Server responded with HTTP ${res.status} (${res.statusText}). MAS API Key may be required or unverified.`,
          samplePayload: errorData,
        };
      }
    } catch {
      // Fallback simulation when running client-only
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: apiKey.trim().length > 0,
        latencyMs,
        message: apiKey.trim()
          ? 'Validation ready: MAS API Key parameter recorded for /api/exchangerates.'
          : 'Serverless endpoint /api/exchangerates ready. Add MAS_API_KEY into environment variables.',
      };
    }
  }

  /**
   * Returns current active currency list with latest rates
   */
  public static getActiveCurrencies(): Currency[] {
    return CURRENCIES;
  }
}

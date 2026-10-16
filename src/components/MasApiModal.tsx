import React, { useState } from 'react';
import { MasApiService, MasTestResult } from '../services/masApiService';
import { MasApiConfig } from '../types/currency';
import {
  X,
  Check,
  Copy,
  Key,
  Server,
  Database,
  Code,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MasApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MasApiModal: React.FC<MasApiModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<MasApiConfig>(() => MasApiService.loadConfig());
  const [keyInput, setKeyInput] = useState<string>(config.apiKey);
  const [authType, setAuthType] = useState<string>('auto');
  const [targetDate, setTargetDate] = useState<string>('2026-10-14');
  const [activeTab, setActiveTab] = useState<'config' | 'guide' | 'schema' | 'backend'>('config');
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<MasTestResult | null>(null);
  const [showRawDetails, setShowRawDetails] = useState<boolean>(false);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    setTesting(true);
    setTestResult(null);

    const saved = MasApiService.saveConfig({
      apiKey: keyInput.trim(),
      lastSynced: new Date().toISOString(),
    });
    setConfig(saved);

    const result = await MasApiService.testConnection(
      keyInput.trim(),
      targetDate,
      authType
    );
    setTestResult(result);
    setTesting(false);
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(MasApiService.getBackendIntegrationSnippet());
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>MAS API Gateway Hub</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                Serverless Ready
              </span>
            </h3>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              <span>Endpoint: exchange_rates_end_of_peiod_daily</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>/api/exchangerates</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Connection & Test</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Portal Setup Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('backend')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'backend'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Serverless Handler</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'schema'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>JSON Schema</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80 text-xs text-neutral-600 dark:text-neutral-300">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  Serverless Live Proxy Active
                </div>
                Requests route through <span className="font-mono">/api/exchangerates</span> to the official MAS API Gateway without hardcoded keys. Your key is stored in your environment or local storage.
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  MAS API Key / Token
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="Paste your MAS API key or client token..."
                    className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:border-neutral-400"
                  />
                </div>
              </div>

              {/* Settings Grid: Auth Header Mode + Target Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Header Convention</span>
                  </label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
                  >
                    <option value="auto">Auto (KeyId / apikey / X-API-KEY)</option>
                    <option value="bearer">OAuth2 Bearer (Authorization: Bearer)</option>
                    <option value="query">URL Query Parameter (?KeyId=...)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Target Date (end_of_day)</span>
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleSaveAndTest}
                  disabled={testing}
                  className="w-full py-2.5 px-4 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-xs"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>{testing ? 'Testing Handshake with MAS...' : 'Test Connection (/api/exchangerates)'}</span>
                </button>
              </div>

              {/* Test Result & Diagnostics */}
              {testResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-bold text-sm leading-tight">{testResult.message}</div>
                      <div className="text-[11px] opacity-80 mt-1 font-mono">
                        Roundtrip: {testResult.latencyMs}ms
                        {testResult.correlationId && ` · MAS Correlation ID: ${testResult.correlationId}`}
                      </div>
                    </div>
                  </div>

                  {!testResult.success && testResult.diagnosis && (
                    <div className="pt-2 border-t border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-200 space-y-1">
                      <div className="font-semibold text-rose-900 dark:text-rose-100">
                        Diagnostics & Fix Steps:
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                        <li>
                          <strong>Application Subscription Required:</strong> In the MAS Developer Portal, your Application must be linked to the <em>"Monthly Statistical Bulletin"</em> API via the <strong>Subscribe</strong> button.
                        </li>
                        <li>
                          <strong>API Key vs OAuth:</strong> If you are using standard API keys, use <em>"Auto (KeyId / apikey)"</em>. If you generated an access token, use <em>"OAuth2 Bearer"</em>.
                        </li>
                        <li>
                          <strong>Date Availability:</strong> The requested date ({targetDate}) must be a Singapore business banking day with published rates.
                        </li>
                      </ul>
                    </div>
                  )}

                  {/* Collapsible Raw Upstream Details */}
                  {testResult.rawUpstreamBody && (
                    <div className="pt-1">
                      <button
                        onClick={() => setShowRawDetails(!showRawDetails)}
                        className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 hover:underline flex items-center gap-1"
                      >
                        {showRawDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        <span>{showRawDetails ? 'Hide' : 'View'} Raw Upstream Gateway Response</span>
                      </button>

                      {showRawDetails && (
                        <pre className="mt-1.5 p-2.5 rounded bg-neutral-900 text-neutral-200 text-[10px] font-mono overflow-x-auto max-h-36">
                          {testResult.rawUpstreamBody}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm mb-1.5">
                  How to Fix "fault:MessageBlocked / Authentication Rejected"
                </h4>
                <p className="text-neutral-600 dark:text-neutral-400">
                  The MAS Gateway operates on an Axway API Manager framework which enforces both credential validation and Application API subscriptions.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                    Step 1: Verify Application Subscription on MAS Portal
                  </div>
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Log in to <span className="font-mono">eservices.mas.gov.sg</span>. Go to <strong>My Applications</strong> &gt; open your app &gt; navigate to the <strong>APIs</strong> tab. Ensure that <strong>"Monthly Statistical Bulletin"</strong> (or Exchange Rates) is checked and <strong>Subscribed</strong>. If an app has a key but no active subscription to the API, the gateway immediately returns <em>MessageBlocked</em>.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                    Step 2: Correct Key Format
                  </div>
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Use your <strong>API Key</strong> (or KeyId) from the application credentials page. Do not include quotes or surrounding whitespace.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                    Step 3: Server Environment Variable
                  </div>
                  <p className="text-neutral-500 dark:text-neutral-400">
                    When you deploy your application, set <span className="font-mono">MAS_API_KEY="your_key"</span> in your environment variables. The serverless route <span className="font-mono">/api/exchangerates</span> will automatically pick it up on every request.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  Serverless proxy handler in <span className="font-mono">/api/exchangerates.ts</span>:
                </span>
                <button
                  onClick={handleCopySnippet}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors flex items-center gap-1.5"
                >
                  {copiedSnippet ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSnippet ? 'Copied' : 'Copy Handler Code'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 text-xs font-mono overflow-x-auto leading-relaxed border border-neutral-800 max-h-72">
                {MasApiService.getBackendIntegrationSnippet()}
              </pre>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="text-xs text-neutral-500">
                Target endpoint:
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px] text-neutral-800 dark:text-neutral-200 break-all">
                https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_peiod_daily?end_of_day=2026-10-14
              </div>

              <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 text-xs font-mono overflow-x-auto leading-relaxed border border-neutral-800">
{`{
  "success": true,
  "source": "mas_api_gateway",
  "targetDate": "2026-10-14",
  "latencyMs": 284,
  "correlationId": "Id-4ba3d16a2466cd06d70abdaf",
  "data": {
    "records": [
      {
        "end_of_day": "2026-10-14",
        "usd_sgd": 1.3365,
        "myr_sgd_100": 29.95,
        "jpy_sgd_100": 0.8558,
        "eur_sgd": 1.4035,
        "gbp_sgd": 1.6778,
        "thb_sgd_100": 3.6710,
        "idr_sgd_100": 0.00814
      }
    ]
  }
}`}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-between text-xs text-neutral-500">
          <span>Axway Gateway Diagnostic Framework</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

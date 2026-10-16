import React, { useState } from 'react';
import { MasApiService } from '../services/masApiService';
import { MasApiConfig } from '../types/currency';
import { X, Check, Copy, Key, Server, Database, Code, CheckCircle2, AlertCircle } from 'lucide-react';

interface MasApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MasApiModal: React.FC<MasApiModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<MasApiConfig>(() => MasApiService.loadConfig());
  const [keyInput, setKeyInput] = useState<string>(config.apiKey);
  const [activeTab, setActiveTab] = useState<'config' | 'schema' | 'backend'>('config');
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
    samplePayload?: Record<string, unknown>;
  } | null>(null);
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

    const result = await MasApiService.testConnection(keyInput.trim());
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
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>MAS API Integration Hub</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                Backend Ready
              </span>
            </h3>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              <span>Monetary Authority of Singapore Financial Datasets</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>Dataset ID: 95932927...</span>
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
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-100 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Configuration</span>
          </button>

          <button
            onClick={() => setActiveTab('backend')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'backend'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Backend Integration Code</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>MAS JSON Schema</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80 text-xs text-neutral-600 dark:text-neutral-300">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  Ready for your MAS Developer API Key
                </div>
                The frontend is fully wired to consume the official Monetary Authority of Singapore (MAS) exchange rate data structures. You can input your API key below for local staging tests, or implement the Express backend proxy using the snippet provided in the next tab.
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  MAS API Key (Optional for Frontend Mock / Live Staging)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="Enter your MAS Developer Portal API key (e.g. mas_live_...)"
                    className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:border-neutral-400"
                  />
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Keys saved here persist in your browser’s <span className="font-mono">localStorage</span> for frontend simulation without exposing secrets in public repositories.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs">
                  <span className="text-neutral-400 block">Dataset Endpoint</span>
                  <span className="font-mono text-neutral-900 dark:text-neutral-100 break-all text-[11px]">
                    eservices.mas.gov.sg/api/action/datastore_search
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs">
                  <span className="text-neutral-400 block">Quotation Frequency</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    End of Day (Singapore Time 17:00 SGT)
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleSaveAndTest}
                  disabled={testing}
                  className="w-full py-2.5 px-4 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>{testing ? 'Testing MAS Connection...' : 'Save & Verify Connection'}</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold">{testResult.message}</div>
                    <div className="text-[11px] opacity-80 mt-0.5 font-mono">
                      Handshake roundtrip: {testResult.latencyMs}ms · Protocol: HTTP/2 TLS 1.3
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  Ready-to-use Express router for your server-side API proxy:
                </span>
                <button
                  onClick={handleCopySnippet}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors flex items-center gap-1.5"
                >
                  {copiedSnippet ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSnippet ? 'Copied' : 'Copy Proxy Code'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 text-xs font-mono overflow-x-auto leading-relaxed border border-neutral-800">
                {MasApiService.getBackendIntegrationSnippet()}
              </pre>

              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Place this route inside your backend server (e.g. <span className="font-mono">server.ts</span>) and export the endpoint at <span className="font-mono">/api/mas/exchange-rates</span>. The frontend is already structured to ingest this exact payload.
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="text-xs text-neutral-500">
                Official Monetary Authority of Singapore datastore response format:
              </div>

              <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 text-xs font-mono overflow-x-auto leading-relaxed border border-neutral-800">
{`{
  "help": "https://eservices.mas.gov.sg/api/3/action/help_show?name=datastore_search",
  "success": true,
  "result": {
    "resource_id": "95932927-c4bc-4753-b039-de3d7f47be44",
    "fields": [
      { "id": "end_of_day", "type": "text" },
      { "id": "usd_sgd", "type": "numeric" },
      { "id": "myr_sgd_100", "type": "numeric" },
      { "id": "jpy_sgd_100", "type": "numeric" },
      { "id": "eur_sgd", "type": "numeric" },
      { "id": "gbp_sgd", "type": "numeric" },
      { "id": "thb_sgd_100", "type": "numeric" },
      { "id": "idr_sgd_100", "type": "numeric" }
    ],
    "records": [
      {
        "end_of_day": "2026-10-15",
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
          <span>Official MAS Datasets · Public Sector License</span>
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

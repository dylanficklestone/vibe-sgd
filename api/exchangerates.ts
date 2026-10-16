import type { Request, Response } from 'express';

// Target MAS API Gateway endpoint provided by user
const MAS_API_BASE =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_peiod_daily';

export default async function handler(req: Request, res: Response) {
  // Set CORS headers for serverless flexibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-mas-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only GET requests are supported.',
    });
  }

  try {
    // 1. Determine target date (default to query or 2026-10-14 as referenced)
    const targetDate = (req.query.end_of_day as string) || '2026-10-14';

    // 2. Extract API Key (NEVER hardcoded; pulled from environment or request header)
    const apiKey =
      (process.env.MAS_API_KEY && process.env.MAS_API_KEY.trim()) ||
      (req.headers['x-mas-api-key'] as string) ||
      (req.headers.authorization ? req.headers.authorization.replace(/^Bearer\s+/i, '') : '');

    // 3. Construct target URL with params
    const masUrl = new URL(MAS_API_BASE);
    masUrl.searchParams.set('end_of_day', targetDate);

    // If additional parameters were passed in the request query (like limit, offset), forward them
    for (const [key, val] of Object.entries(req.query)) {
      if (key !== 'end_of_day' && typeof val === 'string') {
        masUrl.searchParams.set(key, val);
      }
    }

    // 4. Build outgoing headers
    const outgoingHeaders: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'SingaFX-Serverless/1.0',
    };

    if (apiKey) {
      // MAS API gateway standard header conventions
      outgoingHeaders['apikey'] = apiKey;
      outgoingHeaders['Authorization'] = `Bearer ${apiKey}`;
    }

    const startTime = performance.now();
    let upstreamResponse: globalThis.Response;

    try {
      upstreamResponse = await fetch(masUrl.toString(), {
        method: 'GET',
        headers: outgoingHeaders,
        signal: AbortSignal.timeout(8000), // 8s timeout
      });
    } catch (networkError: unknown) {
      const latencyMs = Math.round(performance.now() - startTime);
      const errMessage = networkError instanceof Error ? networkError.message : String(networkError);

      return res.status(502).json({
        success: false,
        error: 'MAS_GATEWAY_UNREACHABLE',
        message: 'Could not connect to the upstream MAS API gateway.',
        details: errMessage,
        requestedUrl: masUrl.toString(),
        latencyMs,
        hasApiKey: Boolean(apiKey),
      });
    }

    const latencyMs = Math.round(performance.now() - startTime);
    const contentType = upstreamResponse.headers.get('content-type') || '';

    // Handle non-200 responses (e.g. 401 Unauthorized if API key is missing or invalid)
    if (!upstreamResponse.ok) {
      let errorBody: unknown = null;
      try {
        if (contentType.includes('application/json')) {
          errorBody = await upstreamResponse.json();
        } else {
          errorBody = await upstreamResponse.text();
        }
      } catch {
        errorBody = null;
      }

      return res.status(upstreamResponse.status).json({
        success: false,
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        message:
          upstreamResponse.status === 401 || upstreamResponse.status === 403
            ? 'Monetary Authority of Singapore (MAS) API rejected the request due to authentication. Please verify your MAS_API_KEY.'
            : `MAS upstream returned status code ${upstreamResponse.status}.`,
        requestedUrl: masUrl.toString(),
        latencyMs,
        hasApiKey: Boolean(apiKey),
        upstreamError: errorBody,
      });
    }

    // Parse MAS JSON response
    const data = await upstreamResponse.json();

    return res.status(200).json({
      success: true,
      source: 'mas_api_gateway',
      targetDate,
      latencyMs,
      hasApiKey: Boolean(apiKey),
      data,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVERLESS_ERROR',
      message: errMessage,
    });
  }
}

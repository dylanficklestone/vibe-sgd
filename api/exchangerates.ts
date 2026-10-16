import type { Request, Response } from 'express';

// Target MAS API Gateway endpoint provided by user
const MAS_API_BASE =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_peiod_daily';

export default async function handler(req: Request, res: Response) {
  // Set CORS headers for serverless flexibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-mas-api-key, x-mas-auth-type');

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
    const rawApiKey =
      (process.env.MAS_API_KEY && process.env.MAS_API_KEY.trim()) ||
      (req.headers['x-mas-api-key'] as string) ||
      (req.headers.authorization ? req.headers.authorization.replace(/^Bearer\s+/i, '') : '') ||
      '';

    const apiKey = rawApiKey.trim();
    const authType = ((req.headers['x-mas-auth-type'] as string) || (req.query.auth_type as string) || 'auto').toLowerCase();

    // 3. Construct target URL with params
    const masUrl = new URL(MAS_API_BASE);
    masUrl.searchParams.set('end_of_day', targetDate);

    // Forward any extra parameters passed in the request query (like limit, offset)
    for (const [key, val] of Object.entries(req.query)) {
      if (key !== 'end_of_day' && key !== 'auth_type' && typeof val === 'string') {
        masUrl.searchParams.set(key, val);
      }
    }

    // 4. Build outgoing headers
    // Use a standard browser User-Agent so WAF / F5 BIG-IP rules on MAS do not block the request
    const outgoingHeaders: Record<string, string> = {
      Accept: 'application/json, text/plain, */*',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    if (apiKey) {
      if (authType === 'bearer' || apiKey.startsWith('Bearer ') || (apiKey.startsWith('ey') && apiKey.includes('.'))) {
        // Explicit OAuth2 Bearer token
        const token = apiKey.replace(/^Bearer\s+/i, '');
        outgoingHeaders['Authorization'] = `Bearer ${token}`;
      } else if (authType === 'query') {
        // Pass in query string
        masUrl.searchParams.set('KeyId', apiKey);
        masUrl.searchParams.set('apikey', apiKey);
      } else {
        // Standard Axway API Gateway / MAS API Manager authentication
        // In Axway API Manager, the default API key header is 'KeyId' or 'apikey' or 'X-API-KEY'.
        // We set these without setting 'Authorization: Bearer' (which triggers OAuth validation failure).
        outgoingHeaders['KeyId'] = apiKey;
        outgoingHeaders['apikey'] = apiKey;
        outgoingHeaders['X-API-KEY'] = apiKey;
        outgoingHeaders['client_id'] = apiKey;
      }
    }

    const startTime = performance.now();
    let upstreamResponse: globalThis.Response;

    try {
      upstreamResponse = await fetch(masUrl.toString(), {
        method: 'GET',
        headers: outgoingHeaders,
        signal: AbortSignal.timeout(9000), // 9s timeout
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
    const correlationId = upstreamResponse.headers.get('x-correlationid') || '';

    // Handle non-200 responses (e.g. 401 Unauthorized from MAS / Axway)
    if (!upstreamResponse.ok) {
      let rawErrorBody = '';
      try {
        rawErrorBody = await upstreamResponse.text();
      } catch {
        rawErrorBody = '';
      }

      // Extract details from Axway SOAP/XML fault if applicable
      let parsedFault = '';
      if (rawErrorBody.includes('fault:MessageBlocked')) {
        parsedFault = 'Axway Gateway MessageBlocked: Authentication rejected or application not subscribed to this API.';
      } else if (rawErrorBody.includes('<faultstring>')) {
        const match = rawErrorBody.match(/<faultstring>(.*?)<\/faultstring>/s);
        if (match) parsedFault = match[1].trim();
      }

      return res.status(upstreamResponse.status).json({
        success: false,
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        correlationId,
        message:
          upstreamResponse.status === 401 || upstreamResponse.status === 403
            ? 'Monetary Authority of Singapore (MAS) API rejected the request due to authentication. Check your application subscription and key.'
            : `MAS upstream returned status code ${upstreamResponse.status}.`,
        diagnosis: {
          parsedFault: parsedFault || 'Authentication failed on MAS Gateway.',
          correlationId,
          possibleCauses: [
            '1. MAS Developer Portal Application is not subscribed to the "Monthly Statistical Bulletin" / "Exchange Rates" API.',
            '2. The key may be a Client ID / Secret or OAuth token requiring a different auth mode.',
            '3. The MAS account has pending approval or IP restriction in the portal.',
          ],
        },
        requestedUrl: masUrl.toString(),
        latencyMs,
        hasApiKey: Boolean(apiKey),
        rawUpstreamBody: rawErrorBody.length > 500 ? rawErrorBody.slice(0, 500) + '...' : rawErrorBody,
      });
    }

    // Try parsing JSON or text response
    let data: unknown;
    if (contentType.includes('application/json')) {
      data = await upstreamResponse.json();
    } else {
      const text = await upstreamResponse.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    return res.status(200).json({
      success: true,
      source: 'mas_api_gateway',
      targetDate,
      latencyMs,
      correlationId,
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

import type { Request, Response } from 'express';

/**
 * Health check endpoint for serverless deployment
 * GET /api/health
 */
export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only GET requests are supported.',
    });
  }

  const hasMasApiKey = Boolean(
    process.env.MAS_API_KEY && process.env.MAS_API_KEY.trim().length > 0
  );

  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    service: 'SingaFX Serverless Engine',
    masConfig: {
      keyConfigured: hasMasApiKey,
      status: hasMasApiKey ? 'ready' : 'manual_key_pending',
      note: hasMasApiKey
        ? 'MAS API Key detected in server environment.'
        : 'MAS API Key not yet injected into server environment. Will accept client X-MAS-API-KEY header or serve cached benchmark.',
    },
  });
}

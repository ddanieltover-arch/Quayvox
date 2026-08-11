import type { VercelRequest, VercelResponse } from '@vercel/node';

export function setCors(res: VercelResponse, methods: string): void {
  res.setHeader('Access-Control-Allow-Origin', process.env.PUBLIC_APP_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export function handleOptions(req: VercelRequest, res: VercelResponse, methods: string): boolean {
  setCors(res, methods);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

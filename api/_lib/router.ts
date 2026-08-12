import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleAuthLogin, handleAuthLogout, handleAuthMe } from './handlers/auth';
import { handleContact } from './handlers/contact';
import { handleNotifyShipment } from './handlers/notify-shipment';
import { handleShipmentById, handleShipmentsCollection } from './handlers/shipments';
import { handleTrack } from './handlers/track';

function pathSegments(req: VercelRequest): string[] {
  const raw = req.query.path;
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string' && raw.length > 0) return [raw];
  return [];
}

export async function routeRequest(req: VercelRequest, res: VercelResponse): Promise<void> {
  const segments = pathSegments(req);
  const [root, second] = segments;

  if (root === 'auth' && second === 'me') {
    await handleAuthMe(req, res);
    return;
  }

  if (root === 'auth' && second === 'login') {
    await handleAuthLogin(req, res);
    return;
  }

  if (root === 'auth' && second === 'logout') {
    await handleAuthLogout(req, res);
    return;
  }

  if (root === 'shipments' && !second) {
    await handleShipmentsCollection(req, res);
    return;
  }

  if (root === 'shipments' && second) {
    await handleShipmentById(req, res, second);
    return;
  }

  if (root === 'track' && second) {
    await handleTrack(req, res, second);
    return;
  }

  if (root === 'contact' && !second) {
    await handleContact(req, res);
    return;
  }

  if (root === 'notify-shipment' && !second) {
    await handleNotifyShipment(req, res);
    return;
  }

  res.status(404).json({ error: 'Not found' });
}

import type { APIRoute } from 'astro';
import { sessionFromRequest } from '../../../lib/auth';
import { json } from '../../../lib/api';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const admin = await sessionFromRequest(request);
    return json({ success: true, admin }, 200, { 'Cache-Control': 'no-store' });
  } catch (err) {
    console.error('[admin] error al validar sesión:', err);
    return json({ error: 'No se pudo validar la sesión.' }, 500);
  }
};

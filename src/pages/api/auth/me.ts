import type { APIRoute } from 'astro';
import { customerSessionFromRequest } from '../../../lib/customer-auth';
import { json } from '../../../lib/api';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const user = await customerSessionFromRequest(request);
    return json({ success: true, user }, 200, { 'Cache-Control': 'no-store' });
  } catch (err) {
    console.error('[auth] error al validar la sesión:', err);
    return json({ error: 'No se pudo validar la sesión.' }, 500);
  }
};
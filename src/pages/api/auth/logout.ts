import type { APIRoute } from 'astro';
import {
  clearCustomerCookieHeader,
  endCustomerSession,
} from '../../../lib/customer-auth';
import { json } from '../../../lib/api';
import { sameOrigin } from '../../../lib/security';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  try {
    await endCustomerSession(request);
    return json(
      { success: true },
      200,
      { 'Set-Cookie': clearCustomerCookieHeader(), 'Cache-Control': 'no-store' },
    );
  } catch (err) {
    console.error('[auth] error al cerrar sesión:', err);
    return json({ error: 'No se pudo cerrar la sesión.' }, 500);
  }
};
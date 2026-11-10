import type { APIRoute } from 'astro';
import { clearCookieHeader, endSession } from '../../../lib/auth';
import { json } from '../../../lib/api';
import { sameOrigin } from '../../../lib/security';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  try {
    await endSession(request);
    return json({ ok: true }, 200, {
      'Set-Cookie': clearCookieHeader(),
      'Cache-Control': 'no-store',
    });
  } catch (err) {
    console.error('[admin] error al cerrar sesión:', err);
    return json({ error: 'No se pudo cerrar la sesión.' }, 500);
  }
};

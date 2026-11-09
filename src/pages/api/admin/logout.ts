import type { APIRoute } from 'astro';
import { clearCookieHeader, endSession } from '../../../lib/auth';
import { json } from '../../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  await endSession(request);
  return json({ ok: true }, 200, {
    'Set-Cookie': clearCookieHeader(),
    'Cache-Control': 'no-store',
  });
};

import type { APIRoute } from 'astro';
import { sql } from 'drizzle-orm';
import { getDb } from '../../lib/db';

export const prerender = false;

export const GET: APIRoute = async () => {
  const db = getDb();
  let healthy = true;

  if (db) {
    try {
      await db.execute(sql`SELECT 1`);
    } catch {
      healthy = false;
    }
  }

  // Sin detalle de la base: solo estado para el health check de Render.
  return new Response(
    JSON.stringify({
      status: healthy ? 'ok' : 'degraded',
      service: 'windytech-web',
      timestamp: new Date().toISOString(),
    }),
    {
      status: healthy ? 200 : 503,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
  );
};

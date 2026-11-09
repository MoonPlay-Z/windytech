import type { APIRoute } from 'astro';
import { sql } from 'drizzle-orm';
import { getDb } from '../../lib/db';

export const prerender = false;

export const GET: APIRoute = async () => {
  const db = getDb();
  let database = db ? 'ok' : 'unconfigured';

  if (db) {
    try {
      await db.execute(sql`SELECT 1`);
    } catch {
      database = 'error';
    }
  }

  return new Response(
    JSON.stringify({
      status: database === 'error' ? 'degraded' : 'ok',
      database,
      service: 'windytech-web',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );
};

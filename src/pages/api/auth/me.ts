import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';
import { sql } from 'drizzle-orm';

export const prerender = false;

export const GET: APIRoute = async () => {
  const db = getDb();

  if (!db) {
    return new Response(
      JSON.stringify({ error: 'Base de datos no configurada' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const result = await db.execute(sql`SELECT id, email, role FROM users LIMIT 1`);
    const user = result.rows[0];

    if (user) {
      const { password_hash, ...userData } = user;
      return new Response(
        JSON.stringify({ success: true, user: userData }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, user: null }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    return new Response(
      JSON.stringify({ error: 'Error interno' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
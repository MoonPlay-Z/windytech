import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';
import { sql } from 'drizzle-orm';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const db = getDb();

  if (!db) {
    return new Response(
      JSON.stringify({ error: 'Base de datos no configurada' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'Todos los campos son obligatorios' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar si el usuario ya existe
    const existing = await db.execute(
      sql`SELECT id FROM users WHERE email = ${email}`
    );
    if (existing.rows.length > 0) {
      return new Response(
        JSON.stringify({ error: 'El correo electrónico ya está registrado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insertar nuevo usuario
    const result = await db.execute(
      sql`INSERT INTO users (name, email, password_hash, role) VALUES (${name}, ${email}, '${password}', 'customer') RETURNING id, email, role`
    );
    const user = result.rows[0];

    return new Response(
      JSON.stringify({ success: true, user }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error en registro:', err);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
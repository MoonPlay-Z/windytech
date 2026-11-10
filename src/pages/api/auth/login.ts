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
    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Correo y contraseña son obligatorios' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Para pruebas: buscar usuario por email
    const result = await db.execute(
      sql`SELECT id, email, password_hash, role FROM users WHERE email = ${email}`
    );

    const user = result.rows[0];

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Credenciales inválidas' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Placeholder: en producción usar bcrypt.compare(password, user.password_hash)
    const passwordValid = password === '123456'; // TODO: reemplazar con comparación real

    if (!passwordValid) {
      return new Response(
        JSON.stringify({ error: 'Credenciales inválidas' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { password_hash, ...userData } = user;

    return new Response(
      JSON.stringify({ success: true, user: userData }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error en login:', err);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
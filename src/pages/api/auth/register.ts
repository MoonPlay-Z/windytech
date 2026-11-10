import type { APIRoute } from 'astro';
import {
  customerCookieHeader,
  registerCustomerAndStartSession,
} from '../../../lib/customer-auth';
import { getDb } from '../../../lib/db';
import { json } from '../../../lib/api';
import { clientIp, rateLimit, sameOrigin } from '../../../lib/security';
import { registerSchema } from '../../../lib/validation';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  if (!getDb()) return json({ error: 'Base de datos no configurada.' }, 500);

  const ip = clientIp(request);
  if (!rateLimit(`customer-register:${ip}`, 5, 60 * 60 * 1000)) {
    return json({ error: 'Demasiados intentos. Intenta de nuevo más tarde.' }, 429);
  }

  try {
    const payload: unknown = await request.json();
    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) return json({ error: 'Revisa tu nombre, correo y contraseña.' }, 422);

    const { user, token, expiresAt } = await registerCustomerAndStartSession(
      parsed.data.name,
      parsed.data.email,
      parsed.data.password,
    );
    return json(
      { success: true, user, redirect: '/cuenta/perfil/' },
      201,
      {
        'Set-Cookie': customerCookieHeader(token, expiresAt),
        'Cache-Control': 'no-store',
      },
    );
  } catch (err) {
    if (err instanceof SyntaxError) return json({ error: 'Datos inválidos.' }, 400);
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      err.code === '23505'
    ) {
      return json({ error: 'El correo electrónico ya está registrado.' }, 409);
    }
    console.error('[auth] error al registrar la cuenta:', err);
    return json({ error: 'No se pudo crear la cuenta. Intenta de nuevo.' }, 500);
  }
};
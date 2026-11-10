import type { APIRoute } from 'astro';
import { authenticateCustomer, customerCookieHeader, startCustomerSession } from '../../../lib/customer-auth';
import { getDb } from '../../../lib/db';
import { clientIp, rateLimit, sameOrigin } from '../../../lib/security';
import { json } from '../../../lib/api';
import { customerLoginSchema } from '../../../lib/validation';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  if (!getDb()) return json({ error: 'Base de datos no configurada.' }, 500);

  const ip = clientIp(request);
  if (!rateLimit(`customer-login:${ip}`, 8, 10 * 60 * 1000)) {
    return json({ error: 'Demasiados intentos. Espera 10 minutos.' }, 429);
  }

  try {
    const payload: unknown = await request.json();
    const parsed = customerLoginSchema.safeParse(payload);
    if (!parsed.success) return json({ error: 'Correo o contraseña inválidos.' }, 422);

    const user = await authenticateCustomer(parsed.data.email, parsed.data.password);
    if (!user) return json({ error: 'Correo o contraseña incorrectos.' }, 401);

    const session = await startCustomerSession(user.id);
    return json(
      { success: true, user, redirect: '/cuenta/perfil/' },
      200,
      {
        'Set-Cookie': customerCookieHeader(session.token, session.expiresAt),
        'Cache-Control': 'no-store',
      },
    );
  } catch (err) {
    if (err instanceof SyntaxError) return json({ error: 'Datos inválidos.' }, 400);
    console.error('[auth] error al iniciar sesión:', err);
    return json({ error: 'No se pudo iniciar sesión. Intenta de nuevo.' }, 500);
  }
};
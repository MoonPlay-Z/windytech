import type { APIRoute } from 'astro';
import { login } from '../../../lib/auth';
import { clientIp, rateLimit, sameOrigin } from '../../../lib/security';
import { loginSchema } from '../../../lib/validation';
import { cookieHeader } from '../../../lib/auth';
import { json } from '../../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);

  const ip = clientIp(request);
  if (!rateLimit(`login:${ip}`, 8, 10 * 60 * 1000)) {
    return json({ error: 'Demasiados intentos. Espera 10 minutos.' }, 429);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Datos inválidos.' }, 400);
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) return json({ error: 'Correo o contraseña inválidos.' }, 422);

  const result = await login(
    parsed.data.email,
    parsed.data.password,
    ip,
    request.headers.get('user-agent') ?? '',
  );

  if ('error' in result) return json({ error: result.error }, 401);

  return json(
    { admin: result.admin, redirect: '/admin/' },
    200,
    {
      'Set-Cookie': cookieHeader(result.token, result.expiresAt),
      'Cache-Control': 'no-store',
    },
  );
};

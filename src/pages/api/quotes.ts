import type { APIRoute } from 'astro';
import { quoteSchema, fieldErrors } from '../../lib/validation';
import { buildQuote } from '../../lib/quote-service';
import { clientIp, rateLimit, sameOrigin } from '../../lib/security';
import { serverEnv } from '../../lib/env';
import { json } from '../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);

  const ip = clientIp(request);
  if (!rateLimit(`quote:${ip}`, 5, 10 * 60 * 1000)) {
    return json({ error: 'Demasiadas solicitudes. Espera unos minutos.' }, 429);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Datos inválidos.' }, 400);
  }

  const parsed = quoteSchema.safeParse(payload);
  if (!parsed.success) {
    return json(
      {
        error: 'Revisa los datos del formulario.',
        fields: fieldErrors(parsed.error),
      },
      422,
    );
  }

  const data = parsed.data;
  if (data.website) return json({ error: 'Solicitud rechazada.' }, 400);
  if (typeof data.elapsedMs === 'number' && data.elapsedMs < 1200) {
    return json({ error: 'Espera un momento antes de enviar.' }, 429);
  }

  const result = await buildQuote(data, serverEnv.siteUrl);
  if (!result.ok) return json({ error: result.error }, result.status);

  return json(
    {
      number: result.number,
      token: result.token,
      path: result.path,
      whatsappUrl: result.whatsappUrl,
      totalCents: result.totalCents,
      totalVesCents: result.totalVesCents,
      currency: result.currency,
    },
    201,
    { 'Cache-Control': 'no-store' },
  );
};

import type { APIRoute } from 'astro';
import { leadSchema, fieldErrors } from '../../lib/validation';
import {
  createLead,
  createTracking,
  findCustomerByEmail,
  updateLeadStatus,
} from '../../lib/db/queries';
import { clientIp, rateLimit, sameOrigin } from '../../lib/security';
import { randomToken } from '../../lib/security';
import { json, readJson } from '../../lib/api';

export const prerender = false;

/**
 * Alta de lead desde el formulario de contacto.
 * Si el correo corresponde a una cuenta, además se crea el seguimiento para
 * que el cliente vea el caso en su panel desde el primer momento.
 */
export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);

  const ip = clientIp(request);
  if (!rateLimit(`lead:${ip}`, 8, 10 * 60 * 1000)) {
    return json({ error: 'Demasiados envíos. Espera unos minutos.' }, 429);
  }

  const parsed = leadSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ error: 'Revisa los datos del formulario.', fields: fieldErrors(parsed.error) }, 422);
  }

  const data = parsed.data;
  if (data.website) return json({ error: 'Solicitud rechazada.' }, 400);
  if (!data.phone && !data.email) {
    return json({ error: 'Indica un teléfono o un correo para poder responderte.' }, 422);
  }

  const customer = data.email ? await findCustomerByEmail(data.email) : null;

  const leadId = await createLead({
    name: data.name,
    business: data.business,
    phone: data.phone,
    email: data.email,
    service: data.service,
    message: data.message,
    channel: data.channel,
    source: data.source,
    campaign: data.campaign,
    customerId: customer?.id ?? null,
  });

  if (!leadId) return json({ error: 'No se pudo registrar la consulta.' }, 503);

  let trackingId: number | null = null;
  if (customer) {
    trackingId = await createTracking({
      customerId: customer.id,
      kind: 'service',
      title: data.service ? `Consulta: ${data.service}` : 'Consulta desde el formulario',
      reference: `LEAD-${leadId}`,
      status: 'solicitado',
      progress: 5,
      summary:
        data.message ||
        'Recibimos tu consulta. Te contactamos para detailar el alcance y el precio.',
      publicToken: randomToken(12),
      note: 'Consulta recibida desde el formulario de contacto.',
    });
    await updateLeadStatus(leadId, 'contacted', trackingId);
  }

  return json({ ok: true, id: leadId }, 201);
};

import type { APIRoute } from 'astro';
import { trackingSchema, fieldErrors } from '../../../../lib/validation';
import { getTracking, updateTracking } from '../../../../lib/db/queries';
import { isValidTrackingStatus, trackingStatus } from '../../../../lib/trackings';
import { notifyCustomer, whatsappMessage } from '../../../../lib/notifier';
import { json, readJson, requireAdmin } from '../../../../lib/api';
import { serverEnv } from '../../../../lib/env';
import { sameOrigin } from '../../../../lib/security';

export const prerender = false;

export const PATCH: APIRoute = async ({ request, params }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'Id inválido.' }, 400);

  const current = await getTracking(id);
  if (!current) return json({ error: 'No se encontró el seguimiento.' }, 404);

  const parsed = trackingSchema.partial().safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ error: 'Datos inválidos.', fields: fieldErrors(parsed.error) }, 422);
  }

  const data = parsed.data;
  const kind = data.kind ?? current.kind;
  const status = data.status ?? current.status;

  if (!isValidTrackingStatus(kind, status)) {
    return json({ error: 'El estado no corresponde a este tipo de seguimiento.' }, 422);
  }

  const updated = await updateTracking(id, {
    title: data.title,
    reference: data.reference,
    status,
    progress: data.progress ?? current.progress,
    summary: data.summary,
    eta: data.eta === undefined ? current.eta : data.eta || null,
    note: data.note,
  });

  if (!updated) return json({ error: 'No se pudo actualizar el seguimiento.' }, 503);

  // Aviso al cliente: entra en su panel y queda listo para WhatsApp.
  const meta = trackingStatus(kind, status);
  const label = meta?.label ?? status;
  const url = `${serverEnv.siteUrl}/cuenta/seguimientos/${current.id}/`;
  const message = whatsappMessage({
    title: current.title,
    status: label,
    reference: current.reference,
    url,
  });

  await notifyCustomer({
    customerId: current.customerId,
    trackingId: current.id,
    title: `Tu «${current.title}» está en ${label.toLowerCase()}`,
    body: message,
    url,
    status: label,
    reference: current.reference,
  });

  return json({ ok: true, whatsapp: message });
};

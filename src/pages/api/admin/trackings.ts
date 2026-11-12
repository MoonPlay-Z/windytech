import type { APIRoute } from 'astro';
import { trackingSchema, fieldErrors } from '../../../lib/validation';
import {
  createTracking,
  deleteTracking,
  findCustomerByEmail,
  listTrackingsAdmin,
} from '../../../lib/db/queries';
import { randomToken } from '../../../lib/security';
import { isValidTrackingStatus, trackingMeta, trackingStatus } from '../../../lib/trackings';
import { json, readJson, requireAdmin } from '../../../lib/api';
import { sameOrigin } from '../../../lib/security';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  return json({ trackings: await listTrackingsAdmin() }, 200, { 'Cache-Control': 'no-store' });
};

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const parsed = trackingSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ error: 'Datos inválidos.', fields: fieldErrors(parsed.error) }, 422);
  }

  const data = parsed.data;

  if (!isValidTrackingStatus(data.kind, data.status)) {
    return json({ error: 'El estado no corresponde a este tipo de seguimiento.' }, 422);
  }

  let customerId = data.customerId ?? null;
  if (!customerId && data.customerEmail) {
    const customer = await findCustomerByEmail(data.customerEmail);
    if (!customer) return json({ error: 'No hay ninguna cuenta con ese correo.' }, 404);
    customerId = customer.id;
  }
  if (!customerId) {
    return json({ error: 'Indica el cliente (correo o id) del seguimiento.' }, 422);
  }

  const id = await createTracking({
    customerId,
    kind: data.kind,
    title: data.title,
    reference: data.reference,
    status: data.status,
    progress: data.progress,
    summary: data.summary,
    eta: data.eta || null,
    publicToken: randomToken(12),
    note: data.note,
  });

  if (!id) return json({ error: 'No se pudo crear el seguimiento.' }, 503);
  return json({ ok: true, id });
};

export const DELETE: APIRoute = async ({ request, url }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const id = Number(url.searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'Id inválido.' }, 400);

  const removed = await deleteTracking(id);
  if (!removed) return json({ error: 'No se encontró el seguimiento.' }, 404);
  return json({ ok: true });
};

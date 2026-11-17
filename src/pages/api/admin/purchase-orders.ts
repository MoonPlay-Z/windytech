import type { APIRoute } from 'astro';
import { deletePurchaseOrder, getPurchaseOrder, listPurchaseOrders, writeAudit } from '../../../lib/db/queries';
import { json, requireAdmin } from '../../../lib/api';
import { sameOrigin } from '../../../lib/security';

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const id = Number(url.searchParams.get('id'));
  if (Number.isInteger(id) && id > 0) {
    const order = await getPurchaseOrder(id);
    if (!order) return json({ error: 'La orden no existe.' }, 404);
    return json({ order }, 200, { 'Cache-Control': 'no-store' });
  }

  return json({ orders: await listPurchaseOrders() }, 200, { 'Cache-Control': 'no-store' });
};

export const DELETE: APIRoute = async ({ request, url }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const id = Number(url.searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'Id inválido.' }, 400);

  const order = await getPurchaseOrder(id);
  if (!order) return json({ error: 'La orden no existe.' }, 404);

  const deleted = await deletePurchaseOrder(id);
  if (!deleted) return json({ error: 'No se pudo eliminar la orden.' }, 503);

  await writeAudit(admin.id, 'DELETE', 'purchase_orders', String(id), {
    number: order.number,
    customerName: order.customerName,
  });
  return json({ ok: true });
};

import type { APIRoute } from 'astro';
import { customerSessionFromRequest } from '../../lib/customer-auth';
import { listCustomerNotifications, markNotificationsRead } from '../../lib/db/queries';
import { json } from '../../lib/api';

export const prerender = false;

/** Novedades del cliente (insignia del panel). */
export const GET: APIRoute = async ({ request, url }) => {
  const customer = await customerSessionFromRequest(request);
  if (!customer) return json({ error: 'No autorizado.' }, 401);

  const onlyUnread = url.searchParams.get('unread') === '1';
  const notifications = await listCustomerNotifications(customer.id, onlyUnread);
  return json({ notifications }, 200, { 'Cache-Control': 'private, no-store' });
};

/** Marca las novedades como leídas. */
export const PATCH: APIRoute = async ({ request }) => {
  const customer = await customerSessionFromRequest(request);
  if (!customer) return json({ error: 'No autorizado.' }, 401);
  await markNotificationsRead(customer.id);
  return json({ ok: true });
};

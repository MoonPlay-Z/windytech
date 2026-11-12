import type { APIRoute } from 'astro';
import { deleteLead, listLeads, updateLeadStatus } from '../../../lib/db/queries';
import { isLeadStatus } from '../../../lib/leads';
import { json, requireAdmin } from '../../../lib/api';
import { sameOrigin } from '../../../lib/security';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  return json({ leads: await listLeads() }, 200, { 'Cache-Control': 'no-store' });
};

export const DELETE: APIRoute = async ({ request, url }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const id = Number(url.searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'Id inválido.' }, 400);

  const removed = await deleteLead(id);
  if (!removed) return json({ error: 'No se encontró el lead.' }, 404);
  return json({ ok: true });
};

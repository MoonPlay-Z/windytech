import type { APIRoute } from 'astro';
import { updateLeadStatus } from '../../../../lib/db/queries';
import { isLeadStatus } from '../../../../lib/leads';
import { json, readJson, requireAdmin } from '../../../../lib/api';
import { sameOrigin } from '../../../../lib/security';

export const prerender = false;

export const PATCH: APIRoute = async ({ request, params }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'Id inválido.' }, 400);

  const body = (await readJson<{ status?: string }>(request)) ?? {};
  const status = String(body.status ?? '');
  if (!isLeadStatus(status)) return json({ error: 'Estado no válido.' }, 422);

  const updated = await updateLeadStatus(id, status);
  if (!updated) return json({ error: 'No se encontró el lead.' }, 404);
  return json({ ok: true });
};

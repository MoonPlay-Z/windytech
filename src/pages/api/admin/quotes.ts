import type { APIRoute } from 'astro';
import { listQuotes, updateQuoteStatus, writeAudit } from '../../../lib/db/queries';
import { json, readJson, requireAdmin } from '../../../lib/api';
import type { QuoteStatus } from '../../../lib/catalog';

export const prerender = false;

const STATUSES: QuoteStatus[] = ['NEW', 'CONTACTED', 'QUOTED', 'CLOSED', 'LOST'];

export const GET: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  return json({ quotes: await listQuotes() }, 200, { 'Cache-Control': 'no-store' });
};

export const PATCH: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const body = await readJson<{ id?: number; status?: string }>(request);
  const id = Number(body?.id);
  const status = body?.status as QuoteStatus | undefined;

  if (!Number.isInteger(id) || id <= 0) return json({ error: 'Id inválido.' }, 400);
  if (!status || !STATUSES.includes(status)) return json({ error: 'Estado inválido.' }, 422);

  await updateQuoteStatus(id, status);
  await writeAudit(admin.id, 'UPDATE', 'quotes', String(id), { status });
  return json({ ok: true });
};

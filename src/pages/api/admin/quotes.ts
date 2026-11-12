import type { APIRoute } from 'astro';
import {
  createTracking,
  getQuoteById,
  listQuotes,
  updateQuoteStatus,
  writeAudit,
} from '../../../lib/db/queries';
import { notifyCustomer } from '../../../lib/notifier';
import { randomToken } from '../../../lib/security';
import { serverEnv } from '../../../lib/env';
import { json, readJson, requireAdmin } from '../../../lib/api';
import { sameOrigin } from '../../../lib/security';
import type { QuoteStatus } from '../../../lib/catalog';

export const prerender = false;

const STATUSES: QuoteStatus[] = ['NEW', 'CONTACTED', 'QUOTED', 'CLOSED', 'LOST'];

export const GET: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  return json({ quotes: await listQuotes() }, 200, { 'Cache-Control': 'no-store' });
};

export const PATCH: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const body = await readJson<{ id?: number; status?: string }>(request);
  const id = Number(body?.id);
  const status = body?.status as QuoteStatus | undefined;

  if (!Number.isInteger(id) || id <= 0) return json({ error: 'Id inválido.' }, 400);
  if (!status || !STATUSES.includes(status)) return json({ error: 'Estado inválido.' }, 422);

  await updateQuoteStatus(id, status);
  await writeAudit(admin.id, 'UPDATE', 'quotes', String(id), { status });

  // Al cerrar la cotización como aceptada, arranca el seguimiento del proyecto
  // y se avisa al cliente (si tiene cuenta en la web).
  if (status === 'CLOSED') {
    const quote = await getQuoteById(id);
    if (quote?.customerId) {
      const trackingId = await createTracking({
        customerId: quote.customerId,
        kind: 'project',
        title: `Proyecto de la cotización ${quote.number ?? id}`,
        reference: quote.number ?? '',
        status: 'planificacion',
        progress: 15,
        summary: `Proyecto en marcha. Presupuesto de ${(quote.totalCents / 100).toFixed(2)} USD.`,
        publicToken: randomToken(12),
        note: 'Proyecto creado al aceptar la cotización.',
      });

      const url = `${serverEnv.siteUrl}/cuenta/seguimientos/`;
      await notifyCustomer({
        customerId: quote.customerId,
        trackingId,
        title: `Aceptamos tu cotización ${quote.number ?? ''}`.trim(),
        body: `Tu proyecto ya está en marcha. Seguimiento: ${url}`,
        url,
        status: 'En planificación',
        reference: quote.number ?? '',
      });
    }
  }

  return json({ ok: true });
};

import type { APIRoute } from 'astro';
import { getQuoteByToken } from '../../../lib/db/queries';
import { json } from '../../../lib/api';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const token = params.token ?? '';
  if (!/^[A-Za-z0-9_-]{10,64}$/.test(token)) {
    return json({ error: 'Cotización no encontrada.' }, 404);
  }

  const quote = await getQuoteByToken(token);
  if (!quote) return json({ error: 'Cotización no encontrada.' }, 404);

  return json(
    {
      number: quote.number,
      customerName: quote.customerName,
      locale: quote.locale,
      currency: quote.currency,
      rateSnapshot: quote.rateSnapshot,
      rateDate: quote.rateDate,
      subtotalCents: quote.subtotalCents,
      discountCents: quote.discountCents,
      taxCents: quote.taxCents,
      totalCents: quote.totalCents,
      totalVesCents: quote.totalVesCents,
      status: quote.status,
      validUntil: quote.validUntil,
      createdAt: quote.createdAt,
      items: quote.items,
    },
    200,
    { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  );
};

import type { APIRoute } from 'astro';
import { currentRate } from '../../lib/rate';
import { json } from '../../lib/api';

export const prerender = false;

export const GET: APIRoute = async () => {
  const rate = await currentRate();
  if (!rate) {
    return json(
      { error: 'No hay una tasa de cambio disponible.', rate: null },
      503,
      { 'Cache-Control': 'no-store' },
    );
  }
  return json(rate, 200, { 'Cache-Control': 'public, max-age=300, s-maxage=300' });
};

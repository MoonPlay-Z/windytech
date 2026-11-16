import type { APIRoute } from 'astro';
import { searchEbayItems, type EbayItemSummary } from '../../../../lib/ebay';
import { json, readJson, requireAdmin } from '../../../../lib/api';
import { sameOrigin } from '../../../../lib/security';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const body = await readJson<{ query?: string; limit?: number; offset?: number }>(request);
  const query = String(body?.query ?? '').trim();
  const limit = Math.min(Math.max(Number(body?.limit ?? 10), 1), 50);
  const offset = Math.max(0, Math.min(Math.round(Number(body?.offset ?? 0) || 0), 5000));
  if (query.length < 2) {
    return json({ error: 'La búsqueda debe tener al menos 2 caracteres.' }, 400);
  }

  try {
    const items: EbayItemSummary[] = await searchEbayItems(query, limit, offset);
    return json(
      { ok: true, query, items, limit, offset: offset + items.length, hasMore: items.length >= limit },
      200,
    );
  } catch (error) {
    console.error('[admin] no se pudo buscar en eBay:', error);
    return json({ error: 'No se pudo buscar en eBay. Revisa la configuración de la cuenta y los datos de la búsqueda.' }, 502);
  }
};

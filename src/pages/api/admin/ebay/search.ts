import type { APIRoute } from 'astro';
import { searchEbayItems, searchEbayItemsByUrl, type EbayItemSummary } from '../../../../lib/ebay';
import { json, readJson, requireAdmin } from '../../../../lib/api';
import { sameOrigin } from '../../../../lib/security';
import { ebayErrorMessage } from '../../../../lib/ebay-errors';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const body = await readJson<{
    query?: string;
    url?: string;
    limit?: number;
    offset?: number;
  }>(request);
  const rawUrl = String(body?.url ?? '').trim();
  const query = String(body?.query ?? '').trim();
  const limit = Math.min(Math.max(Number(body?.limit ?? 10), 1), 50);
  const offset = Math.max(0, Math.min(Math.round(Number(body?.offset ?? 0) || 0), 5000));

  if (!rawUrl && query.length < 2) {
    return json({ error: 'La búsqueda debe tener al menos 2 caracteres.' }, 400);
  }

  try {
    const items: EbayItemSummary[] = rawUrl
      ? await searchEbayItemsByUrl(rawUrl, limit, offset)
      : await searchEbayItems(query, limit, offset);
    return json(
      {
        ok: true,
        query: rawUrl || query,
        items,
        limit,
        offset: offset + items.length,
        hasMore: !rawUrl && items.length >= limit,
      },
      200,
    );
  } catch (error) {
    const info = ebayErrorMessage(error);
    console.error(`[admin] error de eBay (${info.code}):`, error);
    const status = info.code.startsWith('EBAY_LINK') || info.code === 'EBAY_NOT_CONFIGURED' ? 400 : 502;
    return json({ error: info.message, code: info.code }, status);
  }
};

import type { APIRoute } from 'astro';
import { fetchEbayItem, getCachedEbayDetail } from '../../../../lib/ebay';
import { json, readJson, requireAdmin } from '../../../../lib/api';
import { sameOrigin } from '../../../../lib/security';
import { ebayErrorMessage } from '../../../../lib/ebay-errors';

export const prerender = false;

/**
 * Devuelve todas las fotos de un item de eBay para elegir cuáles importar.
 * Solo consulta eBay; no traduce ni sube imágenes, para que sea inmediato.
 */
export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const body = await readJson<{ itemId?: string }>(request);
  const itemId = String(body?.itemId ?? '').trim();
  if (!itemId || itemId.length > 120) {
    return json({ error: 'Indica un item de eBay válido.' }, 400);
  }

  try {
    const detail = getCachedEbayDetail(itemId) ?? (await fetchEbayItem(itemId));
    return json(
      {
        ok: true,
        itemId: detail.itemId || itemId,
        title: detail.title,
        itemWebUrl: detail.itemWebUrl,
        images: detail.images,
      },
      200,
      { 'Cache-Control': 'no-store' },
    );
  } catch (error) {
    const info = ebayErrorMessage(error);
    console.error(`[admin] no se pudieron obtener las fotos de eBay (${info.code}):`, error);
    return json({ error: info.message, code: info.code }, 502);
  }
};

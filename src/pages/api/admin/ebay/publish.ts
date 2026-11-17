import type { APIRoute } from 'astro';
import { getProductAdmin } from '../../../../lib/db/queries';
import { getDb } from '../../../../lib/db';
import { publishProduct, EBAY_PUBLISH_ACTIONS, type EbayPublishAction } from '../../../../lib/ebay';
import { json, readJson, requireAdmin } from '../../../../lib/api';
import { sameOrigin } from '../../../../lib/security';
import { ebayErrorMessage } from '../../../../lib/ebay-errors';
import { sql } from 'drizzle-orm';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const body = await readJson<{ productId?: number; action?: string }>(request);
  const productId = Number(body?.productId);
  const action = body?.action;
  if (!Number.isInteger(productId) || productId <= 0) {
    return json({ error: 'Id de producto inválido.' }, 400);
  }
  if (typeof action !== 'string' || !(EBAY_PUBLISH_ACTIONS as readonly string[]).includes(action)) {
    return json({ error: 'Acción inválida. Usa: create, immediate, relist, end.' }, 400);
  }

  const product = await getProductAdmin(productId);
  if (!product) return json({ error: 'Producto no encontrado.' }, 404);

  const translations = (product.translations ?? []) as Array<{ locale?: string; name?: string }>;
  const esTranslation = translations.find((item) => item.locale === 'es') ?? {};
  const title = String(esTranslation.name ?? '').trim() || `${product.brand} ${product.model}`.trim();

  try {
    const result = await publishProduct({
      productId,
      action: action as EbayPublishAction,
      product: {
        id: product.id,
        title,
        condition: product.condition,
        costCents: product.costCents,
        resaleMarginPercent: product.resaleMarginPercent,
        shippingCostCents: product.shippingCostCents,
        deliveryEstimateDays: product.deliveryEstimateDays,
        priceCents: product.priceCents,
        compareAtCents: product.compareAtCents,
        ebayItemId: product.ebayItemId,
      },
    });

    // Se persisten el itemId, la URL del listing y el estado devueltos por eBay.
    const client = getDb();
    if (client) {
      await client.execute(
        sql`UPDATE products SET ebay_item_id = ${result.itemId},
                ebay_item_url = COALESCE(${result.itemUrl}, ebay_item_url),
                ebay_status = ${action === 'end' ? 'ended' : 'listed'}, updated_at = now()
            WHERE id = ${productId}`,
      );
    }

    return json({ ok: true, ...result }, 200);
  } catch (error) {
    const info = ebayErrorMessage(error);
    console.error(`[admin] no se pudo publicar en eBay (${info.code}):`, error);
    return json({ error: info.message, code: info.code }, 502);
  }
};

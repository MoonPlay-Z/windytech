import type { APIRoute } from 'astro';
import { fetchEbayItem, stripEbayMentions, type EbayItemDetail } from '../../../../lib/ebay';
import { translateEbaySpecs, translateEbayText, translateEbayTitle } from '../../../../lib/ebay-translate';
import { cloudinaryConfigured, uploadRemoteImage } from '../../../../lib/cloudinary';
import { computeResaleFinalPriceCents } from '../../../../lib/pricing';
import {
  categoryExists,
  productIdByEbayItemId,
  productSlugInUse,
  saveProduct,
  writeAudit,
} from '../../../../lib/db/queries';
import { json, readJson, requireAdmin } from '../../../../lib/api';
import { sameOrigin } from '../../../../lib/security';

export const prerender = false;

const MAX_IMAGES = 4;
const IMAGE_FOLDER = 'windytech/productos';

type ImportBody = {
  itemId?: string;
  marginPercent?: number;
  categoryId?: number | null;
  shippingCostCents?: number;
  activate?: boolean;
  /** Datos de la búsqueda, usados si eBay no devuelve el detalle del item. */
  fallback?: {
    title?: string;
    priceValueCents?: number;
    currency?: string;
    condition?: string | null;
    imageUrl?: string | null;
    itemWebUrl?: string | null;
  };
};

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(Math.round(number), min), max);
}

function slugify(value: string): string {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
    .replace(/-+$/g, '');
  return slug || 'producto';
}

/** Convierte la descripción HTML de eBay en texto plano legible. */
function htmlToText(html: string): string {
  if (!html) return '';
  const withBreaks = html
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, ' ')
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '- ')
    .replace(/<\s*\/\s*(p|div|li|tr|h[1-6])\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  const decoded = withBreaks
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));
  return decoded
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function mapCondition(detail: EbayItemDetail): 'NEW' | 'REFURBISHED_A' | 'USED' {
  const value = `${detail.condition ?? ''} ${detail.conditionId ?? ''}`.toLowerCase();
  if (value.includes('refurb') || ['2010', '2020', '2030'].includes(detail.conditionId ?? '')) {
    return 'REFURBISHED_A';
  }
  if (value.includes('used') || value.includes('pre-owned')) return 'USED';
  return 'NEW';
}

/**
 * Genera un slug único a partir del nombre. No se añade el id del item de eBay:
 * la URL pública no debe delatar el origen del producto.
 */
async function uniqueSlug(base: string): Promise<string> {
  const root = base.slice(0, 110).replace(/-+$/g, '');
  let candidate = root;
  let index = 2;
  while (await productSlugInUse('es', candidate)) {
    candidate = `${root}-${index}`.slice(0, 120).replace(/-+$/g, '');
    index += 1;
    if (index > 50) {
      candidate = `${root}-${Date.now().toString(36)}`.slice(0, 120);
      break;
    }
  }
  return candidate;
}

/** Construye un detalle mínimo con los datos del resumen de búsqueda. */
function fallbackDetail(itemId: string, raw: ImportBody['fallback']): EbayItemDetail | null {
  const title = String(raw?.title ?? '').trim().slice(0, 180);
  const priceValueCents = Math.round(Number(raw?.priceValueCents ?? 0));
  if (!title || !Number.isFinite(priceValueCents) || priceValueCents <= 0) return null;
  const imageUrl = String(raw?.imageUrl ?? '').trim();
  return {
    itemId,
    title,
    priceValueCents,
    currency: String(raw?.currency ?? 'USD').trim().slice(0, 8) || 'USD',
    condition: raw?.condition ? String(raw.condition).slice(0, 80) : null,
    conditionId: null,
    images: /^https?:\/\//i.test(imageUrl) ? [imageUrl] : [],
    itemWebUrl: String(raw?.itemWebUrl ?? '').slice(0, 2000),
    brand: '',
    aspects: {},
    description: '',
    shippingCostCents: 0,
    seller: '',
  };
}

function buildSpecs(detail: EbayItemDetail): Record<string, string> {
  const specs: Record<string, string> = {};
  let count = 0;
  for (const [key, value] of Object.entries(detail.aspects)) {
    if (count >= 20) break;
    const name = key.trim().slice(0, 80);
    const aspectValue = value.trim().slice(0, 200);
    if (!name || !aspectValue) continue;
    specs[name] = aspectValue;
    count += 1;
  }
  // El origen eBay se guarda en products.ebay_item_id (uso interno del panel);
  // no se expone en las especificaciones públicas.
  return specs;
}

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const body = await readJson<ImportBody>(request);
  const itemId = String(body?.itemId ?? '').trim();
  if (!itemId || itemId.length > 120) {
    return json({ error: 'Indica un item de eBay válido.' }, 400);
  }

  const categoryId = body?.categoryId ? Number(body.categoryId) : null;
  if (categoryId && !(await categoryExists(categoryId))) {
    return json({ error: 'La categoría seleccionada no existe.' }, 422);
  }

  const existing = await productIdByEbayItemId(itemId);
  if (existing) {
    return json(
      {
        error: `Este item de eBay ya está en tu catálogo (producto #${existing}).`,
        productId: existing,
      },
      409,
    );
  }

  let detail: EbayItemDetail;
  const warnings: string[] = [];
  try {
    detail = await fetchEbayItem(itemId);
  } catch (error) {
    console.error('[admin] no se pudo consultar el item de eBay:', error);
    // La sandbox devuelve 404 en algunos items que sí aparecen en la búsqueda:
    // en ese caso se importa con los datos del resumen que envió el panel.
    const notFound = error instanceof Error && /404|not found/i.test(error.message);
    const fallback = notFound ? fallbackDetail(itemId, body?.fallback) : null;
    if (!fallback) {
      return json(
        { error: 'No se pudo consultar el item en eBay. Revisa la configuración y el enlace.' },
        502,
      );
    }
    detail = fallback;
    warnings.push(
      'eBay no devolvió el detalle completo; se importó con los datos de la búsqueda (sin envío ni descripción).',
    );
  }

  if (!detail.title || detail.priceValueCents <= 0) {
    return json({ error: 'El item de eBay no tiene título o precio válido.' }, 422);
  }

  const marginPercent = clampInt(body?.marginPercent, 0, 100, 30);
  const shippingCostCents = clampInt(
    body?.shippingCostCents,
    0,
    1_000_000,
    detail.shippingCostCents,
  );
  const priceCents = computeResaleFinalPriceCents({
    costCents: detail.priceValueCents,
    shippingCostCents,
    marginPercent,
  });
  if (priceCents <= 0) {
    return json({ error: 'No se pudo calcular el precio de reventa.' }, 422);
  }

  let images: { cloudinaryPublicId: string; alt: string; isPrimary: boolean; position: number }[] = [];
  if (detail.images.length > 0) {
    if (!cloudinaryConfigured()) {
      warnings.push('Las imágenes no se importaron porque Cloudinary no está configurado.');
    } else {
      const sources = detail.images.slice(0, MAX_IMAGES);
      const uploads = await Promise.allSettled(
        sources.map((url) => uploadRemoteImage(url, IMAGE_FOLDER)),
      );
      const alt = detail.title.slice(0, 200);
      images = uploads.flatMap((result, index) => {
        if (result.status !== 'fulfilled' || !result.value) return [];
        return [
          {
            cloudinaryPublicId: result.value.publicId,
            alt,
            isPrimary: index === 0,
            position: index,
          },
        ];
      });
      if (images.length < sources.length) {
        warnings.push(
          `Se importaron ${images.length} de ${sources.length} imágenes; el resto no se pudo descargar.`,
        );
      }
      if (images.length > 0) {
        images = images.map((image, index) => ({ ...image, isPrimary: index === 0, position: index }));
      }
    }
  }

  const name = await translateEbayTitle(detail.title);
  const plainDescription = htmlToText(detail.description);
  const translatedDescription = await translateEbayText(plainDescription);
  const sourceText = translatedDescription || name;
  // La descripción pública no menciona eBay: el origen queda solo en la ficha
  // interna del producto (ebay_item_id).
  const descriptionMd = stripEbayMentions(sourceText).slice(0, 20_000);
  const shortDescription = stripEbayMentions(sourceText)
    .replace(/\s+/g, ' ')
    .slice(0, 280);
  const slug = await uniqueSlug(slugify(name));
  const model = (detail.aspects.Model ?? detail.aspects['Modelo'] ?? '').slice(0, 180);

  let productId: number | null;
  try {
    productId = await saveProduct({
      categoryId,
      brand: (detail.brand || 'eBay').slice(0, 120),
      model,
      condition: mapCondition(detail),
      priceCents,
      compareAtCents: null,
      costCents: detail.priceValueCents,
      resaleMarginPercent: marginPercent,
      shippingCostCents,
      deliveryEstimateDays: 21,
      ebayItemId: detail.itemId,
      ebayItemUrl: detail.itemWebUrl || null,
      ebayStatus: 'listed',
      sku: `WT-${detail.itemId.replace(/\D+/g, '') || Date.now().toString(36)}`.slice(0, 80),
      availability: 'IN_STOCK',
      isActive: Boolean(body?.activate),
      isFeatured: false,
      specs: await translateEbaySpecs(buildSpecs(detail)),
      translations: [
        {
          locale: 'es',
          slug,
          name,
          shortDescription,
          descriptionMd,
          seoTitle: name.slice(0, 200),
          seoDescription: shortDescription.slice(0, 320),
        },
      ],
      images,
    });
  } catch (error) {
    console.error('[admin] no se pudo importar el producto de eBay:', error);
    return json({ error: 'No se pudo guardar el producto importado.' }, 500);
  }

  if (!productId) {
    return json({ error: 'La base de datos no está disponible.' }, 503);
  }

  await writeAudit(admin.id, 'IMPORT', 'products', String(productId), {
    ebayItemId: detail.itemId,
    priceCents,
    marginPercent,
    images: images.length,
    isActive: Boolean(body?.activate),
  });

  return json(
    {
      ok: true,
      productId,
      slug,
      priceCents,
      costCents: detail.priceValueCents,
      shippingCostCents,
      marginPercent,
      images: images.length,
      isActive: Boolean(body?.activate),
      warnings,
    },
    201,
  );
};

import { serverEnv } from './env';
import { computeResaleFinalPriceCents } from './pricing';

/**
 * Servicio de eBay (Selling API) para publicar/republicar productos con el
 * precio de reventa calculado (costo + envío + margen) e envío incluido.
 *
 * Requiere en runtime: EBAY_CLIENT_ID, EBAY_CLIENT_SECRET, EBAY_REFRESH_TOKEN y EBAY_OAUTH_SCOPE.
 * Sin esos valores el servicio lanza error y la API responde 502.
 */

export const EBAY_PUBLISH_ACTIONS = ['create', 'immediate', 'relist', 'end'] as const;
export type EbayPublishAction = (typeof EBAY_PUBLISH_ACTIONS)[number];

const API_BASE = serverEnv.ebaySandbox ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com';
const SELL_BASE = `${API_BASE}/sell/v1`;
const TOKEN_URL = `${API_BASE}/identity/v1/oauth2/token`;

const CONDITION_MAP: Record<string, string> = {
  NEW: 'New',
  REFURBISHED_A: 'Refurbished',
  USED: 'Used',
};

/**
 * URL pública de un item de eBay. Los IDs del Browse API son compuestos
 * (`v1|<itemId>|<variationId>`); la URL del listing usa solo el itemId.
 * Se usa como respaldo para productos antiguos que no guardaron su URL.
 */
export function ebayItemWebUrl(itemId: string | null | undefined): string | null {
  const raw = String(itemId ?? '').trim();
  if (!raw) return null;
  const match = /^v\d+\|(\d+)(?:\|\d+)?$/.exec(raw);
  const publicId = match?.[1] ?? raw;
  return `https://www.ebay.com/itm/${encodeURIComponent(publicId)}`;
}

export type EbayPublishInput = {
  productId: number;
  action: EbayPublishAction;
  product: {
    id: number;
    title: string;
    condition: string;
    costCents: number;
    resaleMarginPercent: number;
    shippingCostCents: number;
    deliveryEstimateDays: number;
    priceCents?: number;
    compareAtCents?: number | null;
    ebayItemId?: string | null;
  };
};

export type EbayPublishResult = {
  itemId: string | null;
  /** URL del listing en eBay (null al retirar un item). */
  itemUrl: string | null;
  finalPriceCents: number;
  action: EbayPublishAction;
};

let tokenCache: { accessToken: string; expiresAt: number } | null = null;

/** Scope público para tokens de aplicación (Browse API, sin usuario). */
const APP_SCOPE = 'https://api.ebay.com/oauth/api_scope';

async function requestToken(params: URLSearchParams): Promise<string> {
  const env = serverEnv;
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${env.ebayClientId}:${env.ebayClientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `No se pudo obtener el token de eBay (${response.status}): ${detail.slice(0, 200)}`,
    );
  }
  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error('eBay no devolvió access_token.');
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in ?? 3600) * 1000,
  };
  return tokenCache.accessToken;
}

async function getAccessToken(): Promise<string> {
  const env = serverEnv;
  // Token manual para pruebas: evita cualquier flujo (caduca en ~2 h).
  if (env.ebayAccessToken) return env.ebayAccessToken;
  if (!env.ebayClientId || !env.ebayClientSecret) {
    throw new Error(
      'eBay no está configurado: faltan EBAY_CLIENT_ID o EBAY_CLIENT_SECRET.',
    );
  }
  const cached = tokenCache;
  if (cached && cached.expiresAt - 60_000 > Date.now()) {
    return cached.accessToken;
  }

  // 1) Token de usuario (necesario para publicar en eBay).
  if (env.ebayRefreshToken) {
    try {
      return await requestToken(
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: env.ebayRefreshToken,
          scope: env.ebayOAuthScope,
        }),
      );
    } catch (error) {
      console.error('[ebay] el refresh token falló; se usa un token de aplicación:', error);
    }
  }

  // 2) Token de aplicación (suficiente para buscar e importar del catálogo).
  return requestToken(
    new URLSearchParams({ grant_type: 'client_credentials', scope: APP_SCOPE }),
  );
}

async function ebayRequest<T = unknown>(path: string, init: { method: string; body?: unknown }): Promise<T> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${SELL_BASE}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Language': 'en-US',
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`eBay respondió ${response.status}: ${detail}`);
  }
  return (await response.json()) as T;
}

async function createEbayItem(input: {
  title: string;
  finalPriceCents: number;
  condition: string;
  deliveryEstimateDays?: number;
}): Promise<{ itemId: string; itemWebUrl: string }> {
  const item = await ebayRequest<{ itemId?: string; itemWebUrl?: string }>('/item', {
    method: 'POST',
    body: {
      item: {
        title: input.title,
        price: { value: (input.finalPriceCents / 100).toFixed(2), currency: 'USD' },
        condition: CONDITION_MAP[input.condition] ?? 'New',
      },
    },
  });
  const itemId = item?.itemId;
  if (!itemId) throw new Error('eBay no devolvió itemId al crear el listing.');
  // Algunas respuestas no traen itemWebUrl: se construye con el dominio del entorno.
  const itemWebUrl =
    String(item?.itemWebUrl ?? '').trim() ||
    `https://${serverEnv.ebaySandbox ? 'www.sandbox.ebay.com' : 'www.ebay.com'}/itm/${encodeURIComponent(itemId)}`;
  return { itemId, itemWebUrl };
}

async function endEbayItem(itemId: string): Promise<void> {
  await ebayRequest(`/item/${encodeURIComponent(itemId)}/end`, { method: 'POST' });
}

export type EbayItemSummary = {
  itemId: string;
  title: string;
  priceValueCents: number;
  currency: string;
  condition?: string | null;
  imageUrl?: string | null;
  itemWebUrl?: string | null;
};

export type EbayItemDetail = {
  itemId: string;
  title: string;
  priceValueCents: number;
  currency: string;
  condition: string | null;
  conditionId: string | null;
  images: string[];
  itemWebUrl: string;
  brand: string;
  aspects: Record<string, string>;
  description: string;
  shippingCostCents: number;
  seller: string;
};

type EbayImage = { imageUrl?: string };

/** Claves de especificaciones que son solo de uso interno (origen eBay). */
const EBAY_INTERNAL_SPEC_KEYS = ['fuente', 'vendedor ebay', 'item ebay', 'ebay'];

/** Pie de origen que se añadía al importar: "Importado desde eBay: ...". */
const EBAY_SOURCE_PATTERN = /\n[ \t]*\n[ \t]*---[ \t\r\n]*Importado desde eBay[\s\S]*$/i;

/**
 * Quita el pie de origen de eBay de una descripción. El cliente final no debe
 * saber que el producto se importó desde eBay.
 */
export function stripEbaySource(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(EBAY_SOURCE_PATTERN, '').trim();
}

const EBAY_URL_PATTERN = /https?:\/\/(?:[\w-]+\.)*ebay\.[a-z.]+\S*/gi;
const EBAY_WORD_PATTERN = /\bebay(?:'s)?\b/gi;

/**
 * Elimina menciones y enlaces a eBay del texto que ve el cliente (muchas
 * descripciones de vendedores los incluyen). Las sustituye por la marca.
 */
export function stripEbayMentions(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(EBAY_URL_PATTERN, '')
    .replace(EBAY_WORD_PATTERN, (match) => (/['’]s$/i.test(match) ? "Windytech's" : 'Windytech'))
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/** Quita las claves internas de eBay de las especificaciones públicas. */
export function stripEbaySpecs(specs?: Record<string, string> | null): Record<string, string> {
  if (!specs) return {};
  const cleaned: Record<string, string> = {};
  for (const [key, value] of Object.entries(specs)) {
    if (EBAY_INTERNAL_SPEC_KEYS.includes(key.trim().toLowerCase())) continue;
    cleaned[key] = value;
  }
  return cleaned;
}

function parsePriceCents(price?: { value?: string; currency?: string } | null): number {
  const value = Number(price?.value ?? 0);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

/**
 * Busca items en el catálogo de eBay (Browse API /item_summary/search).
 * Se usa para descubrir productos que luego se importan al catálogo propio.
 */
export async function searchEbayItems(query: string, limit = 10, offset = 0): Promise<EbayItemSummary[]> {
  const accessToken = await getAccessToken();
  const url = new URL(`${API_BASE}/buy/browse/v1/item_summary/search`);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Language': 'en-US',
    },
  });
  if (!response.ok) {
    throw new Error(`eBay respondió ${response.status} al buscar items (${query}).`);
  }
  const data = (await response.json()) as {
    itemSummaries?: Array<{
      itemId?: string;
      title?: string;
      condition?: string;
      price?: { value?: string; currency?: string };
      image?: EbayImage;
      itemWebUrl?: string;
    }>;
  };
  const items = data.itemSummaries ?? [];
  return items.map((item) => ({
    itemId: String(item.itemId ?? ''),
    title: String(item.title ?? ''),
    priceValueCents: parsePriceCents(item.price),
    currency: String(item.price?.currency ?? 'USD'),
    condition: item.condition ?? null,
    imageUrl: item.image?.imageUrl ?? null,
    itemWebUrl: item.itemWebUrl ?? null,
  }));
}

/**
 * Obtiene el detalle completo de un item de eBay (Browse API /item/{itemId}).
 * Devuelve imágenes, envío, marca, aspectos y descripción para importarlo
 * al catálogo propio.
 */
export async function fetchEbayItem(itemId: string): Promise<EbayItemDetail> {
  const accessToken = await getAccessToken();
  const response = await fetch(
    `${API_BASE}/buy/browse/v1/item/${encodeURIComponent(itemId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      },
    },
  );
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`eBay respondió ${response.status} al consultar el item ${itemId}: ${detail.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    itemId?: string;
    title?: string;
    price?: { value?: string; currency?: string };
    condition?: string;
    conditionId?: string;
    image?: EbayImage;
    additionalImages?: EbayImage[];
    itemWebUrl?: string;
    brand?: string;
    description?: string;
    localizedAspects?: Array<{ name?: string; value?: string }>;
    shippingOptions?: Array<{
      shippingCost?: { value?: string; currency?: string };
      shippingCostType?: string;
    }>;
    seller?: { username?: string };
  };

  const images: string[] = [];
  for (const image of [data.image, ...(data.additionalImages ?? [])]) {
    const url = image?.imageUrl;
    if (url && !images.includes(url)) images.push(url);
  }

  const aspects: Record<string, string> = {};
  for (const aspect of data.localizedAspects ?? []) {
    const name = aspect.name?.trim();
    const value = aspect.value?.trim();
    if (name && value && !(name in aspects)) aspects[name] = value;
  }

  const shippingCosts = (data.shippingOptions ?? [])
    .map((option) => parsePriceCents(option.shippingCost))
    .filter((cents) => Number.isFinite(cents));
  const shippingCostCents = shippingCosts.length > 0 ? Math.min(...shippingCosts) : 0;

  return {
    itemId: String(data.itemId ?? itemId),
    title: String(data.title ?? '').trim(),
    priceValueCents: parsePriceCents(data.price),
    currency: String(data.price?.currency ?? 'USD'),
    condition: data.condition ?? null,
    conditionId: data.conditionId ?? null,
    images,
    itemWebUrl: data.itemWebUrl ?? '',
    brand: String(data.brand ?? aspects.Brand ?? '').trim(),
    aspects,
    description: data.description ?? '',
    shippingCostCents,
    seller: data.seller?.username ?? '',
  };
}

/**
 * Publica un producto en eBay con la lógica de las opciones elegidas:
 * - create | immediate → publica un listing nuevo (entrega inmediata o nueva reventa).
 * - relist → retira el item actual y republica con el nuevo precio final.
 * - end → retira el item actual.
 */
export async function publishProduct(input: EbayPublishInput): Promise<EbayPublishResult> {
  const finalPriceCents = computeResaleFinalPriceCents({
    costCents: input.product.costCents,
    shippingCostCents: input.product.shippingCostCents,
    marginPercent: input.product.resaleMarginPercent,
  });

  if (input.action === 'end') {
    if (input.product.ebayItemId) await endEbayItem(input.product.ebayItemId);
    return {
      itemId: input.product.ebayItemId ?? null,
      itemUrl: null,
      finalPriceCents,
      action: input.action,
    };
  }

  const shouldRecreate = input.action === 'relist';
  if (shouldRecreate && input.product.ebayItemId) {
    await endEbayItem(input.product.ebayItemId);
  }

  const created = await createEbayItem({
    title: input.product.title,
    finalPriceCents,
    condition: input.product.condition,
    deliveryEstimateDays: input.product.deliveryEstimateDays,
  });

  return {
    itemId: created.itemId,
    itemUrl: created.itemWebUrl,
    finalPriceCents,
    action: input.action,
  };
}

/** Dominios de eBay aceptados en enlaces (evita SSRF con URLs arbitrarias). */
function isEbayHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, '');
  return (
    host === 'ebay.io' ||
    host.endsWith('.ebay.io') ||
    /^(ebay\.[a-z.]+|[a-z0-9-]+\.ebay\.[a-z.]+)$/.test(host)
  );
}

function itemIdFromUrl(url: URL): string | null {
  const match = /(?:^|\/)itm\/(\d+)/.exec(url.pathname);
  if (match?.[1]) return match[1];
  return url.searchParams.get('itemId') ?? url.searchParams.get('itemid') ?? null;
}

/**
 * Busca un producto a partir de un enlace de eBay (p. ej. https://ebay.io/m/Fd5FrL).
 * Sigue la redirección, extrae el itemId y consulta el detalle con Browse API.
 * Si el enlace apunta a una búsqueda, usa su término (`_nkw`).
 */
export async function searchEbayItemsByUrl(
  rawUrl: string,
  limit = 10,
  offset = 0,
): Promise<EbayItemSummary[]> {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new Error('El enlace no es válido.');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('El enlace debe ser http o https.');
  }
  if (!isEbayHost(url.hostname)) {
    throw new Error('Usa un enlace de eBay (ebay.com, ebay.io o un dominio local de eBay).');
  }

  let finalUrl = url;
  const directId = itemIdFromUrl(url);
  if (!directId) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; Windytech/1.0; +https://windytech.studio)',
          accept: 'text/html',
        },
      });
      finalUrl = new URL(response.url);
    } catch {
      throw new Error('No se pudo abrir el enlace de eBay. Comprueba que sea válido.');
    } finally {
      clearTimeout(timer);
    }
    if (!isEbayHost(finalUrl.hostname)) {
      throw new Error('El enlace redirige fuera de eBay.');
    }
  }

  const itemId = directId ?? itemIdFromUrl(finalUrl);
  if (itemId) {
    const detail = await fetchEbayItem(itemId);
    return [
      {
        itemId: detail.itemId || itemId,
        title: detail.title,
        priceValueCents: detail.priceValueCents,
        currency: detail.currency,
        condition: detail.condition,
        imageUrl: detail.images[0] ?? null,
        itemWebUrl: detail.itemWebUrl || finalUrl.toString(),
      },
    ];
  }

  const term = finalUrl.searchParams.get('_nkw')?.trim();
  if (term && term.length >= 2) return searchEbayItems(term, limit, offset);

  throw new Error('El enlace no corresponde a un producto ni a una búsqueda de eBay.');
}

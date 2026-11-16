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
  finalPriceCents: number;
  action: EbayPublishAction;
};

let tokenCache: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const env = serverEnv;
  if (!env.ebayClientId || !env.ebayClientSecret || !env.ebayRefreshToken) {
    throw new Error(
      'eBay no está configurado: faltan EBAY_CLIENT_ID, EBAY_CLIENT_SECRET o EBAY_REFRESH_TOKEN.',
    );
  }
  const cached = tokenCache;
  if (cached && cached.expiresAt - 60_000 > Date.now()) {
    return cached.accessToken;
  }
  const basicAuth = `Basic ${btoa(`${env.ebayClientId}:${env.ebayClientSecret}`)}`;
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: env.ebayRefreshToken,
    scope: env.ebayOAuthScope,
  });
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: basicAuth,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  if (!response.ok) {
    throw new Error(`No se pudo obtener el token de acceso de eBay (${response.status}).`);
  }
  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) {
    throw new Error('eBay no devolvió access_token.');
  }
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in ?? 3600) * 1000,
  };
  return tokenCache.accessToken;
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
}): Promise<{ itemId: string }> {
  const item = await ebayRequest<{ itemId?: string }>('/item', {
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
  return { itemId };
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
};

/**
 * Busca items en el catálogo de eBay (Browse API /item_summary/search).
 * Se usa para descubrir productos comparables antes de publicar en reventa.
 */
export async function searchEbayItems(query: string, limit = 10): Promise<EbayItemSummary[]> {
  const accessToken = await getAccessToken();
  const url = new URL(`${API_BASE}/buy/browse/v1/item_summary/search`);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));
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
    }>;
  };
  return (data.itemSummaries ?? []).map((item) => ({
    itemId: String(item.itemId ?? ''),
    title: String(item.title ?? ''),
    priceValueCents: Number(item.price?.value ?? 0) * 100,
    currency: String(item.price?.currency ?? 'USD'),
    condition: item.condition ?? null,
  }));
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
    return { itemId: input.product.ebayItemId ?? null, finalPriceCents, action: input.action };
  }

  const shouldRecreate = input.action === 'relist';
  if (shouldRecreate && input.product.ebayItemId) {
    await endEbayItem(input.product.ebayItemId);
  }

  const itemId = (
    await createEbayItem({
      title: input.product.title,
      finalPriceCents,
      condition: input.product.condition,
      deliveryEstimateDays: input.product.deliveryEstimateDays,
    })
  ).itemId;

  return { itemId, finalPriceCents, action: input.action };
}

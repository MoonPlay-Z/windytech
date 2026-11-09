import { randomToken } from './security';
import { computeTotals, resolvePrice } from './pricing';
import { getProductsByIds, createQuote } from './db/queries';
import { currentRate } from './rate';
import { quotePath, type Locale } from './catalog';
import { site } from '../data/site';
import type { QuoteInput } from './validation';

export type QuoteBuildResult =
  | {
      ok: true;
      number: string;
      token: string;
      path: string;
      whatsappUrl: string;
      totalCents: number;
      totalVesCents: number | null;
      currency: 'USD' | 'VES';
    }
  | { ok: false; status: number; error: string };

const QUOTE_VALID_DAYS = 7;

function whatsappText(number: string, url: string, locale: Locale): string {
  return locale === 'es'
    ? `Hola Windytech, quiero cotizar ${number}:\n${url}`
    : `Hello Windytech, I would like a quote for ${number}:\n${url}`;
}

/** Recalcula una cotización completa desde la base. El navegador solo envía ids y cantidades. */
export async function buildQuote(input: QuoteInput, siteUrl: string): Promise<QuoteBuildResult> {
  const locale = input.locale as Locale;

  const rate = input.currency === 'VES' ? await currentRate() : null;
  if (input.currency === 'VES' && !rate) {
    return {
      ok: false,
      status: 409,
      error:
        locale === 'es'
          ? 'No hay una tasa de cambio disponible en este momento. Intenta de nuevo en unos minutos.'
          : 'No exchange rate is available right now. Please try again in a few minutes.',
    };
  }

  const ids = [...new Set(input.items.map((item) => item.productId))];
  const products = await getProductsByIds(locale, ids);
  if (products.length === 0) {
    return {
      ok: false,
      status: 409,
      error:
        locale === 'es'
          ? 'Los productos de la cotización ya no están disponibles.'
          : 'The products in this quote are no longer available.',
    };
  }

  const now = new Date();
  const items: {
    productId: number;
    variantId: number | null;
    nameSnapshot: string;
    attributesSnapshot: Record<string, string>;
    unitPriceCents: number;
    quantity: number;
    lineTotalCents: number;
  }[] = [];

  for (const item of input.items) {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) {
      return {
        ok: false,
        status: 409,
        error:
          locale === 'es'
            ? 'Uno de los productos ya no está disponible. Actualiza el carrito.'
            : 'One of the products is no longer available. Please refresh your cart.',
      };
    }

    const variantId = item.variantId ?? null;
    const variant = variantId ? product.variants.find((entry) => entry.id === variantId) : null;
    if (variantId && !variant) {
      return {
        ok: false,
        status: 409,
        error:
          locale === 'es'
            ? 'La opción seleccionada ya no existe. Actualiza el carrito.'
            : 'The selected option no longer exists. Please refresh your cart.',
      };
    }

    const price = resolvePrice(product, variant ?? null, product.rules, now, locale);
    const quantity = Math.min(Math.max(1, Math.trunc(item.quantity)), 20);
    items.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      nameSnapshot: product.name,
      attributesSnapshot: variant?.attributes ?? {},
      unitPriceCents: price.unitCents,
      quantity,
      lineTotalCents: price.unitCents * quantity,
    });
  }

  const totals = computeTotals(
    items.map((item) => ({
      listCents: item.unitPriceCents,
      unitCents: item.unitPriceCents,
      quantity: item.quantity,
    })),
  );

  const totalVesCents =
    rate && rate.rate > 0 ? Math.round(totals.totalCents * rate.rate) : null;

  const token = randomToken(16);
  const validUntil = new Date(now.getTime() + QUOTE_VALID_DAYS * 24 * 60 * 60 * 1000);

  const created = await createQuote({
    number: null,
    publicToken: token,
    customerName: input.customerName,
    phone: input.phone,
    email: input.email,
    notes: input.notes,
    locale,
    currency: input.currency,
    rateSnapshot: rate?.rate ?? null,
    rateDate: rate?.date ?? null,
    subtotalCents: totals.subtotalCents,
    discountCents: totals.discountCents,
    taxCents: totals.taxCents,
    totalCents: totals.totalCents,
    totalVesCents,
    validUntil,
    items,
  });

  if (!created) {
    return {
      ok: false,
      status: 503,
      error:
        locale === 'es'
          ? 'No pudimos guardar la cotización. Escríbenos por WhatsApp mientras lo solucionamos.'
          : 'We could not save the quote. Please message us on WhatsApp while we fix it.',
    };
  }

  const url = `${siteUrl}${quotePath(locale, created.token)}`;
  return {
    ok: true,
    number: created.number,
    token: created.token,
    path: quotePath(locale, created.token),
    whatsappUrl: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
      whatsappText(created.number, url, locale),
    )}`,
    totalCents: totals.totalCents,
    totalVesCents,
    currency: input.currency,
  };
}

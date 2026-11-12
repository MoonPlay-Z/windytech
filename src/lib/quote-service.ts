import { randomToken } from './security';
import { notifyCustomer, whatsappMessage } from './notifier';
import { computeTotals, resolvePrice } from './pricing';
import { createQuote, createTracking, findCustomerByEmail, getProductsByIds } from './db/queries';
import { currentRate } from './rate';
import { quotePath } from './catalog';
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

function whatsappText(number: string, url: string): string {
  return `Hola Windytech, quiero cotizar ${number}:\n${url}`;
}

/** Recalcula una cotización completa desde la base. El navegador solo envía ids y cantidades. */
export async function buildQuote(input: QuoteInput, siteUrl: string): Promise<QuoteBuildResult> {
  const locale = 'es';

  const rate = input.currency === 'VES' ? await currentRate() : null;
  if (input.currency === 'VES' && !rate) {
    return {
      ok: false,
      status: 409,
      error: 'No hay una tasa de cambio disponible en este momento. Intenta de nuevo en unos minutos.',
    };
  }

  const ids = [...new Set(input.items.map((item) => item.productId))];
  const products = await getProductsByIds(ids);
  if (products.length === 0) {
    return {
      ok: false,
      status: 409,
      error: 'Los productos de la cotización ya no están disponibles.',
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
        error: 'Uno de los productos ya no está disponible. Actualiza el carrito.',
      };
    }

    const variantId = item.variantId ?? null;
    const variant = variantId ? product.variants.find((entry) => entry.id === variantId) : null;
    if (variantId && !variant) {
      return {
        ok: false,
        status: 409,
        error: 'La opción seleccionada ya no existe. Actualiza el carrito.',
      };
    }

    const price = resolvePrice(product, variant ?? null, product.rules, now);
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

  // Si el cliente tiene cuenta, su cotización queda registrada en su panel.
  const customer = input.email ? await findCustomerByEmail(input.email) : null;

  const created = await createQuote({
    number: null,
    publicToken: token,
    customerName: input.customerName,
    phone: input.phone,
    email: input.email,
    customerId: customer?.id ?? null,
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

  if (customer && created?.number) {
    const trackingId = await createTracking({
      customerId: customer.id,
      kind: 'quote',
      title: `Cotización ${created.number}`,
      reference: created.number,
      status: 'recibida',
      progress: 15,
      summary: `Presupuesto por ${totals.totalCents / 100} USD para ${
        items.length
      } producto(s). Te avisamos cuando lo revises.`,
      publicToken: randomToken(12),
      note: 'Cotización creada desde el sitio.',
    });

    const panelUrl = `${siteUrl}/cuenta/seguimientos/`;
    await notifyCustomer({
      customerId: customer.id,
      trackingId,
      title: `Recibimos tu cotización ${created.number}`,
      body: whatsappMessage({
        title: `Cotización ${created.number}`,
        status: 'Recibida',
        reference: created.number,
        url: panelUrl,
      }),
      url: panelUrl,
      status: 'Recibida',
      reference: created.number,
    });
  }

  if (!created) {
    return {
      ok: false,
      status: 503,
      error: 'No pudimos guardar la cotización. Escríbenos por WhatsApp mientras lo solucionamos.',
    };
  }

  const url = `${siteUrl}${quotePath(created.token)}`;
  return {
    ok: true,
    number: created.number,
    token: created.token,
    path: quotePath(created.token),
    whatsappUrl: `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
      whatsappText(created.number, url),
    )}`,
    totalCents: totals.totalCents,
    totalVesCents,
    currency: input.currency,
  };
}

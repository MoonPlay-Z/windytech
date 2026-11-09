export type PriceLocale = 'es' | 'en';

export type PromotionRule = {
  id: number;
  type: 'PERCENT' | 'FIXED';
  value: number;
  priority: number;
  startsAt: Date | string;
  endsAt: Date | string | null;
  isActive: boolean;
  badgeEs?: string;
  badgeEn?: string;
  productIds: number[];
  categoryIds: number[];
};

export type PriceableProduct = {
  id: number;
  categoryId: number | null;
  priceCents: number;
  compareAtCents: number | null;
};

export type PriceableVariant =
  | {
      id: number;
      priceCents: number | null;
      compareAtCents: number | null;
    }
  | null
  | undefined;

export type ResolvedPrice = {
  unitCents: number;
  listCents: number;
  compareAtCents: number;
  discountCents: number;
  promotionId: number | null;
  badge: string;
};

function timestamp(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

export function promotionMatches(
  rule: PromotionRule,
  product: PriceableProduct,
  now: Date,
): boolean {
  if (!rule.isActive) return false;
  const current = now.getTime();
  const start = timestamp(rule.startsAt);
  if (start !== null && start > current) return false;
  const end = timestamp(rule.endsAt);
  if (end !== null && end < current) return false;

  const hasTargets = rule.productIds.length > 0 || rule.categoryIds.length > 0;
  if (!hasTargets) return true;
  if (rule.productIds.includes(product.id)) return true;
  return product.categoryId !== null && rule.categoryIds.includes(product.categoryId);
}

function discountFor(rule: PromotionRule, baseCents: number): number {
  const raw =
    rule.type === 'PERCENT'
      ? Math.round((baseCents * Math.max(0, rule.value)) / 100)
      : Math.max(0, rule.value);
  return Math.min(Math.max(0, raw), baseCents);
}

export function resolvePrice(
  product: PriceableProduct,
  variant: PriceableVariant,
  rules: PromotionRule[],
  now: Date = new Date(),
  locale: PriceLocale = 'es',
): ResolvedPrice {
  const listCents = variant?.priceCents ?? product.priceCents;
  const compareAtCents = variant?.compareAtCents ?? product.compareAtCents ?? 0;

  let best: { rule: PromotionRule; discount: number } | null = null;
  for (const rule of rules) {
    if (!promotionMatches(rule, product, now)) continue;
    const discount = discountFor(rule, listCents);
    if (discount <= 0) continue;
    if (
      !best ||
      discount > best.discount ||
      (discount === best.discount && rule.priority > best.rule.priority) ||
      (discount === best.discount && rule.priority === best.rule.priority && rule.id < best.rule.id)
    ) {
      best = { rule, discount };
    }
  }

  const discountCents = best?.discount ?? 0;
  const badge = best
    ? (locale === 'es' ? best.rule.badgeEs : best.rule.badgeEn) ||
      (best.rule.type === 'PERCENT' ? `-${best.rule.value}%` : 'Oferta')
    : '';

  return {
    unitCents: listCents - discountCents,
    listCents,
    compareAtCents: discountCents > 0 ? Math.max(compareAtCents, listCents) : compareAtCents,
    discountCents,
    promotionId: best?.rule.id ?? null,
    badge,
  };
}

export type TotalsLine = {
  listCents: number;
  unitCents: number;
  quantity: number;
};

export function computeTotals(lines: TotalsLine[], taxRate = 0) {
  let subtotalCents = 0;
  let discountCents = 0;

  for (const line of lines) {
    const quantity = Math.max(1, Math.trunc(line.quantity));
    subtotalCents += line.listCents * quantity;
    discountCents += Math.max(0, line.listCents - line.unitCents) * quantity;
  }

  const taxableCents = subtotalCents - discountCents;
  const taxCents =
    taxRate > 0 ? Math.round((taxableCents * taxRate) / 100) : 0;
  const totalCents = taxableCents + taxCents;

  return { subtotalCents, discountCents, taxCents, totalCents };
}

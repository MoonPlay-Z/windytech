import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePrice, computeTotals, promotionMatches } from './pricing';

const now = new Date('2026-11-09T10:00:00-04:00');

const product = {
  id: 1,
  categoryId: 10,
  priceCents: 100000,
  compareAtCents: 120000,
};

describe('resolvePrice', () => {
  it('devuelve precio base sin promoción', () => {
    const price = resolvePrice(product, null, [], now);
    assert.strictEqual(price.unitCents, 100000);
    assert.strictEqual(price.discountCents, 0);
    assert.strictEqual(price.promotionId, null);
  });

  it('aplica descuento porcentual', () => {
    const rules = [{ id: 1, type: 'PERCENT', value: 20, priority: 0, startsAt: now, endsAt: null, isActive: true, badgeEs: '', badgeEn: '', productIds: [], categoryIds: [10] }];
    const price = resolvePrice(product, null, rules, now);
    assert.strictEqual(price.unitCents, 80000);
    assert.strictEqual(price.discountCents, 20000);
    assert.strictEqual(price.promotionId, 1);
  });

  it('aplica descuento fijo con tope al precio base', () => {
    const rules = [{ id: 1, type: 'FIXED', value: 200000, priority: 0, startsAt: now, endsAt: null, isActive: true, badgeEs: '', badgeEn: '', productIds: [], categoryIds: [] }];
    const price = resolvePrice(product, null, rules, now);
    assert.strictEqual(price.unitCents, 0);
  });

  it('usa precio de variante si existe', () => {
    const variant = { id: 2, priceCents: 150000, compareAtCents: null };
    const price = resolvePrice(product, variant, [], now);
    assert.strictEqual(price.unitCents, 150000);
  });

  it('elige la promoción con mayor descuento', () => {
    const rules = [
      { id: 1, type: 'PERCENT', value: 10, priority: 5, startsAt: now, endsAt: null, isActive: true, badgeEs: '', badgeEn: '', productIds: [], categoryIds: [] },
      { id: 2, type: 'PERCENT', value: 30, priority: 1, startsAt: now, endsAt: null, isActive: true, badgeEs: '', badgeEn: '', productIds: [], categoryIds: [] },
    ];
    const price = resolvePrice(product, null, rules, now);
    assert.strictEqual(price.unitCents, 70000);
    assert.strictEqual(price.promotionId, 2);
  });

  it('ignora promociones vencidas', () => {
    const past = new Date('2026-01-01');
    const rules = [{ id: 1, type: 'PERCENT', value: 50, priority: 0, startsAt: past, endsAt: past, isActive: true, badgeEs: '', badgeEn: '', productIds: [], categoryIds: [] }];
    const price = resolvePrice(product, null, rules, now);
    assert.strictEqual(price.unitCents, 100000);
  });
});

describe('computeTotals', () => {
  it('suma líneas y descuentos', () => {
    const lines = [
      { listCents: 10000, unitCents: 8000, quantity: 2 },
      { listCents: 5000, unitCents: 5000, quantity: 1 },
    ];
    const totals = computeTotals(lines);
    assert.strictEqual(totals.subtotalCents, 25000);
    assert.strictEqual(totals.discountCents, 4000);
    assert.strictEqual(totals.totalCents, 21000);
  });
});

describe('promotionMatches', () => {
  it('coincide por categoría', () => {
    const rule = { id: 1, type: 'PERCENT', value: 10, priority: 0, startsAt: now, endsAt: null, isActive: true, badgeEs: '', badgeEn: '', productIds: [], categoryIds: [10] };
    assert.strictEqual(promotionMatches(rule, product, now), true);
  });

  it('no coincide sin targets (aplica a todo)', () => {
    const rule = { id: 1, type: 'PERCENT', value: 10, priority: 0, startsAt: now, endsAt: null, isActive: true, badgeEs: '', badgeEn: '', productIds: [], categoryIds: [] };
    assert.strictEqual(promotionMatches(rule, product, now), true);
  });
});

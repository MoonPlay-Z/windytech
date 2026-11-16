#!/usr/bin/env node
/**
 * Smoke test de la integración eBay (solo lectura).
 * Usa EBAY_ACCESS_TOKEN si está definido; si no, refresca con EBAY_REFRESH_TOKEN.
 *
 * Uso: npx tsx scripts/ebay-smoke.ts "drone" 3
 */
import 'dotenv/config';
import { searchEbayItems } from '../src/lib/ebay';

const query = process.argv[2] ?? 'drone';
const limit = Number(process.argv[3] ?? 5);

const items = await searchEbayItems(query, limit);
console.log(`Resultados para "${query}": ${items.length}`);
for (const item of items) {
  console.log(
    `- ${item.itemId} | ${item.title} | ${item.currency} ${(item.priceValueCents / 100).toFixed(2)} | ${item.condition ?? '—'}`,
  );
}

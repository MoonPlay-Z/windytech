/** Utilidades de dinero. Todos los importes se guardan en centavos enteros. */

export function formatUsd(cents: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format((cents ?? 0) / 100);
}

export function formatVes(cents: number, locale = 'es-VE'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2,
  }).format((cents ?? 0) / 100);
}

/** rate = bolívares por dólar. Devuelve centavos de bolívar. */
export function usdCentsToVesCents(usdCents: number, rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) return 0;
  return Math.round(usdCents * rate);
}

export function parseMoneyToCents(input: unknown): number | null {
  if (typeof input === 'number' && Number.isFinite(input)) return Math.round(input * 100);
  if (typeof input !== 'string') return null;
  const normalized = input.replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

export function centsFromInput(input: unknown): number | null {
  if (typeof input === 'number' && Number.isFinite(input)) return Math.round(input);
  if (typeof input !== 'string') return null;
  const normalized = input.replace(/\s/g, '').replace(/[.,]/g, '');
  if (!/^\d+$/.test(normalized)) return null;
  return Number(normalized);
}

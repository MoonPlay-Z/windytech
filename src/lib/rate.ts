import { getLatestRate, saveRate } from './db/queries';

export type RateResult = {
  rate: number;
  date: string;
  source: string;
  stale: boolean;
};

const PROVIDERS = [
  'https://ve.dolarapi.com/v1/dolares/oficial',
  'https://pydolarve.org/api/v1/dollar?page=bcv',
];

function parseRate(payload: unknown): number | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as Record<string, unknown>;
  const candidates = [data.promedio, data.price, data.rate, data.value, data.monitor];
  for (const candidate of candidates) {
    const value = typeof candidate === 'object' && candidate
      ? Number((candidate as Record<string, unknown>).price)
      : Number(candidate);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return null;
}

/** Consulta la tasa oficial del BCV. Si el proveedor falla, usa la última guardada. */
export async function fetchBcvRate(): Promise<RateResult | null> {
  for (const url of PROVIDERS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8_000);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { accept: 'application/json', 'user-agent': 'Windytech/1.0 (+https://windytech.studio)' },
      });
      clearTimeout(timer);
      if (!response.ok) continue;
      const rate = parseRate(await response.json());
      if (rate) {
        const today = new Date().toISOString().slice(0, 10);
        await saveRate(rate, new URL(url).hostname);
        return { rate, date: today, source: new URL(url).hostname, stale: false };
      }
    } catch {
      /* siguiente proveedor */
    }
  }
  return null;
}

/**
 * Tasa vigente para mostrar precios en bolívares.
 * Nunca devuelve una tasa inventada: si no hay proveedor ni histórico, devuelve null.
 */
export async function currentRate(): Promise<RateResult | null> {
  const stored = await getLatestRate();
  if (!stored) return null;

  const ageMs = Date.now() - new Date(`${stored.date}T00:00:00Z`).getTime();
  const stale = ageMs > 48 * 60 * 60 * 1000;

  if (!stored.isManual && ageMs > 12 * 60 * 60 * 1000) {
    const fresh = await fetchBcvRate();
    if (fresh) return fresh;
  }

  return { rate: stored.rate, date: stored.date, source: 'stored', stale };
}

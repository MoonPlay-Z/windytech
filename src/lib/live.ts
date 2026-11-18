/**
 * Utilidades puras del sistema de actualización en vivo.
 *
 * Viven en `lib` (y no en `scripts`) para poder probarlas con node:test sin
 * necesidad de DOM. El motor que toca el DOM está en `scripts/live-updates.ts`.
 */

export interface LiveStats {
  products: number;
  projects: number;
  posts: number;
  services: number;
  newQuotes: number;
  quotes: number;
  closedQuotes: number;
  newLeads: number;
  trackingsActive: number;
  trackingsDelivered: number;
  orders: number;
}

export const EMPTY_LIVE_STATS: LiveStats = {
  products: 0,
  projects: 0,
  posts: 0,
  services: 0,
  newQuotes: 0,
  quotes: 0,
  closedQuotes: 0,
  newLeads: 0,
  trackingsActive: 0,
  trackingsDelivered: 0,
  orders: 0,
};

function toCount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/** Convierte la respuesta del endpoint de métricas en un objeto seguro. */
export function parseLiveStats(payload: unknown): LiveStats | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const data = payload as Record<string, unknown>;
  const stats = { ...EMPTY_LIVE_STATS };
  for (const key of Object.keys(stats) as (keyof LiveStats)[]) {
    stats[key] = toCount(data[key]);
  }
  return stats;
}

/** Tono visual de una orden, espejo de `statusTone` en el panel. */
export type OrderTone = 'success' | 'pending' | 'danger' | 'neutral';

export function orderTone(status: string): OrderTone {
  const value = status.toUpperCase();
  if (['PAID', 'COMPLETED'].includes(value)) return 'success';
  if (['PENDING', 'NEW', 'PROCESSING'].includes(value)) return 'pending';
  if (['CANCELLED', 'FAILED'].includes(value)) return 'danger';
  return 'neutral';
}

/** IDs presentes en el lote nuevo que aún no estaban en la tabla. */
export function newOrderIds(known: number[], incoming: number[]): number[] {
  const seen = new Set(known);
  return incoming.filter((id) => Number.isFinite(id) && !seen.has(id));
}

/** Solo se anima el valor cuando ha cambiado realmente. */
export function liveValueChanged(current: string | null, next: string): boolean {
  return (current ?? '').trim() !== next.trim();
}

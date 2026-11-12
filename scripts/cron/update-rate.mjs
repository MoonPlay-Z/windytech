#!/usr/bin/env node
/**
 * Cron diario de la tasa BCV (Render Cron Job, 12:00 UTC).
 * Consulta la tasa oficial, la guarda en exchange_rates y expone /api/rate.
 *
 * Variables requeridas: DATABASE_URL
 * Opcionales: PUBLIC_CLOUDINARY_* (no usadas aquí)
 */
import { saveRate } from '../../src/lib/db/queries';
import { currentRate, fetchBcvRate } from '../../src/lib/rate';

(async () => {
  console.log('[cron:rate] Iniciando actualización de tasa BCV...');

  const fresh = await fetchBcvRate();
  if (fresh) {
    console.log(`[cron:rate] Tasa actualizada: ${fresh.rate} (${fresh.source}, ${fresh.date})`);
  } else {
    const stored = await currentRate();
    if (stored) {
      console.log(`[cron:rate] Proveedor no disponible. Usando tasa guardada: ${stored.rate} (${stored.date}, stale=${stored.stale})`);
    } else {
      console.error('[cron:rate] No hay tasa disponible ni proveedor respondió.');
      process.exit(1);
    }
  }

  process.exit(0);
})().catch((error) => {
  console.error('[cron:rate] Error inesperado:', error);
  process.exit(1);
});

import { fidbc } from './db/client.js';

// Cache de tasa BCV en memoria (sobre pool de DB)
let tasaCache = null;
let ultimaActualizacion = 0;
const TTL_TASA = 24 * 60 * 60 * 1000; // 24 horas

export async function getTasa() {
  if (tasaCache && Date.now() - ultimaActualizacion < TTL_TASA) {
    return tasaCache;
  }
  try {
    const res = await fetch('https://api.tasaBCV.com/v1/rate', {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error('No disponible');
    const data = await res.json();
    tasaCache = data.rate;
    ultimaActualizacion = Date.now();
    return tasaCache;
  } catch {
    // Si falla la API, retornar lo último en caché o null
    return tasaCache;
  }
}

export async function refreshTasa() {
  const nueva = await getTasa();
  if (nueva) {
    await db.query(
      'INSERT INTO system_config (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
      ['bcv_rate', nueva]
    );
  }
  return getTasa();
}

// Endpoint interno: refrescar si está vieja
export async function checkRate(req, res) {
  const actual = await getTasa();
  res.json({ rate: actual, cached: !!(tasaCache && Date.now() - ultimaActualizacion < TTL_TASA) });
}

// Endpoint de sincronización cron protegido
export async function syncRate(req, res) {
  const secret = req.get('x-cron-secret') || '';
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  await refreshTasa();
  res.json({ success: true, rate: await getTasa() });
}
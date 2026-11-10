import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/** Hash SHA-256 en hexadecimal (tokens de sesión, huellas de IP). */
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Token aleatorio URL-safe sin dependencias externas. */
export function randomToken(bytes = 24): string {
  return randomBytes(bytes).toString('base64url');
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Comprueba que una petición de escritura venga del mismo origen. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // peticiones same-origin sin Origin (curl, tests)
  try {
    const url = new URL(request.url);
    const source = new URL(origin);
    const normalize = (host: string) => host.replace(/^www\./, '');
    return normalize(source.host) === normalize(url.host);
  } catch {
    return false;
  }
}

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * Rate limit en memoria. Suficiente para un único proceso Node en Render.
 * No se usa para datos sensibles, solo para contener abuso del formulario.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function clientIp(request: Request, fallback = 'unknown'): string {
  const forwarded = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? fallback;
}

/** Detecta Venezuela usando Cloudflare o cabeceras de proxy. */
export function isVenezuela(request: Request): boolean {
  const country = (
    request.headers.get('cf-ipcountry') ??
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('x-country') ??
    ''
  ).toUpperCase();
  if (country) return country === 'VE';
  const language = request.headers.get('accept-language') ?? '';
  return /\bes[-_]?ve\b/i.test(language);
}

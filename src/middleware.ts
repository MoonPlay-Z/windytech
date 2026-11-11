import { defineMiddleware } from 'astro:middleware';
import { sameOrigin } from './lib/security';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const ADMIN = /^\/admin(\/|$)/;
const PRIVATE = /^\/(api|admin)(\/|$)|^\/cotizacion\/[^/]+/;

/**
 * El sitio es solo en español: las rutas /en/... se redirigen (301) a su
 * equivalente en español para no romper los enlaces ya compartidos.
 */
const EN_PREFIXES: [string, string][] = [
  ['/en/services', '/servicios'],
  ['/en/catalog', '/catalogo'],
  ['/en/projects', '/proyectos'],
  ['/en/blog', '/blog'],
  ['/en/cart', '/carrito'],
  ['/en/quote', '/cotizacion'],
  ['/en/about', '/nosotros'],
  ['/en/legal/privacy', '/legal/privacidad'],
  ['/en/legal/terms', '/legal/terminos'],
];

function spanishPath(pathname: string): string | null {
  for (const [from, to] of EN_PREFIXES) {
    if (pathname === from) return `${to}/`;
    if (pathname.startsWith(`${from}/`)) return to + pathname.slice(from.length);
  }
  if (pathname === '/en' || pathname === '/en/') return '/';
  return null;
}

/** Cabeceras de seguridad que antes vivían en vercel.json / public/_headers. */
function harden(headers: Headers, pathname: string) {
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()',
  );
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  if (PRIVATE.test(pathname)) {
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    headers.set('Cache-Control', 'private, no-store');
  } else if (pathname.startsWith('/_astro/') || pathname.startsWith('/assets/')) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (
    pathname.startsWith('/catalogo') ||
    pathname.startsWith('/proyectos') ||
    pathname.startsWith('/blog')
  ) {
    headers.set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context;

  // Todo el sitio es en español: /en/... va a su equivalente en español.
  const spanish = spanishPath(url.pathname);
  if (spanish && spanish !== url.pathname) {
    const target = new URL(spanish + url.search, url.origin);
    return new Response(null, { status: 301, headers: { Location: target.toString() } });
  }

  // Protección CSRF propia: compara hosts (no esquema) y tolera proxies.
  // Astro trae `checkOrigin`, pero rechaza antes de poder normalizar
  // apex/www o el protocolo terminado en el proxy.
  if (UNSAFE_METHODS.has(request.method) && !sameOrigin(request)) {
    const headers = { 'Content-Type': 'application/json; charset=utf-8' };
    return new Response(JSON.stringify({ error: 'Origen no permitido.' }), {
      status: 403,
      headers: url.pathname.startsWith('/api/') ? headers : { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // Render ya redirige los dominios secundarios (www → apex) a su dominio
  // primario. No redirigimos aquí para no crear un bucle entre ambos.

  const response = await next();
  harden(response.headers, url.pathname);

  // El panel nunca debe quedar cacheado por un CDN intermedio.
  if (ADMIN.test(url.pathname)) {
    response.headers.set('Cache-Control', 'private, no-store');
  }

  return response;
});

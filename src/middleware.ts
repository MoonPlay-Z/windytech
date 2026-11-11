import { defineMiddleware } from 'astro:middleware';
import { sameOrigin } from './lib/security';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const ADMIN = /^\/admin(\/|$)/;
const PRIVATE = /^\/(api|admin)(\/|$)|^\/(cotizacion|en\/quote)\/[^/]+/;

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
    pathname.startsWith('/en/catalog') ||
    pathname.startsWith('/proyectos') ||
    pathname.startsWith('/en/projects') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/en/blog')
  ) {
    headers.set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context;

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

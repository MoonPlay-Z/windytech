import { defineMiddleware } from 'astro:middleware';

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

  // Apex → www (308) para conservar el canonical del sitio.
  if (url.hostname === 'windytech.studio') {
    const target = new URL(request.url);
    target.hostname = 'www.windytech.studio';
    target.protocol = 'https:';
    return new Response(null, {
      status: 308,
      headers: { Location: target.toString() },
    });
  }

  const response = await next();
  harden(response.headers, url.pathname);

  // El panel nunca debe quedar cacheado por un CDN intermedio.
  if (ADMIN.test(url.pathname)) {
    response.headers.set('Cache-Control', 'private, no-store');
  }

  return response;
});

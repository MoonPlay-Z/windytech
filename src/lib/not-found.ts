import type { AstroGlobal } from 'astro';

/**
 * Renderiza la página 404 con estado HTTP 404.
 *
 * Redirigir a /404/ devuelve un 302 y los buscadores lo tratan como "soft 404";
 * reescribir la ruta conserva el estado correcto para retirar la URL del índice.
 */
export async function notFoundResponse(astro: AstroGlobal): Promise<Response> {
  const rewritten = await astro.rewrite('/404/');
  const contentType = rewritten.headers.get('content-type') ?? 'text/html; charset=utf-8';
  return new Response(rewritten.body, {
    status: 404,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    },
  });
}

import type { APIRoute } from 'astro';

export const prerender = false;

/** Página a la que eBay redirige si el usuario rechaza el consentimiento. */
export const GET: APIRoute = async () => {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>eBay · acceso denegado</title>
    <style>body{font-family:system-ui,sans-serif;max-width:640px;margin:48px auto;padding:0 20px;line-height:1.55;color:#1f2937}</style>
    </head><body>
      <h1>Acceso denegado</h1>
      <p>No se concedió permiso a la aplicación para usar tu cuenta de eBay.</p>
      <p>Puedes intentarlo de nuevo desde el Developer Portal de eBay.</p>
    </body></html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};

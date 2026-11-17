import type { APIRoute } from 'astro';
import { serverEnv } from '../../../lib/env';
import { ebayErrorMessage, parseEbayApiError } from '../../../lib/ebay-errors';

export const prerender = false;

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function page(title: string, body: string): Response {
  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <style>
      body{font-family:system-ui,sans-serif;max-width:760px;margin:48px auto;padding:0 20px;line-height:1.55;color:#1f2937}
      h1{font-size:1.5rem}textarea{width:100%;height:130px;font-family:monospace;font-size:13px;padding:10px;border:1px solid #d1d5db;border-radius:8px}
      code{background:#f3f4f6;padding:2px 6px;border-radius:4px}
      .box{border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-top:20px}
    </style></head>
    <body>${body}</body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

/**
 * Callback del consentimiento OAuth de eBay.
 * eBay redirige aquí con ?code=... y lo intercambiamos por access + refresh token.
 * El refresh token se muestra una sola vez para guardarlo en EBAY_REFRESH_TOKEN.
 */
export const GET: APIRoute = async ({ url }) => {
  const code = url.searchParams.get('code');
  if (!code) {
    return page(
      'eBay · falta el código',
      '<h1>Falta el código de autorización</h1><p>eBay no devolvió el parámetro <code>code</code>. Vuelve a iniciar el consentimiento desde el Developer Portal de eBay.</p>',
    );
  }

  if (!serverEnv.ebayClientId || !serverEnv.ebayClientSecret || !serverEnv.ebayRedirectUri) {
    return page(
      'eBay · configuración incompleta',
      '<h1>Configuración incompleta</h1><p>Faltan <code>EBAY_CLIENT_ID</code>, <code>EBAY_CLIENT_SECRET</code> o <code>EBAY_REDIRECT_URI</code> (RuName) en el servidor.</p>',
    );
  }

  const base = serverEnv.ebaySandbox ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com';
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: serverEnv.ebayRedirectUri,
  });

  try {
    const response = await fetch(`${base}/identity/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${serverEnv.ebayClientId}:${serverEnv.ebayClientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    const text = await response.text();
    if (!response.ok) {
      const detail = await response.text();
      const info = parseEbayApiError(response.status, detail);
      console.error(`[ebay] error intercambiando el código (${info.code}):`, detail);
      return page(
        'eBay · error de token',
        `<h1>No se pudo obtener el token</h1><p><strong>${info.code}</strong>: ${escapeHtml(info.message)}</p>`,
      );
    }
    const data = JSON.parse(text) as {
      refresh_token?: string;
      access_token?: string;
      expires_in?: number;
      refresh_token_expires_in?: number;
    };
    if (!data.refresh_token) {
      return page('eBay · sin refresh token', '<h1>eBay no devolvió refresh_token</h1>');
    }
    console.log('[ebay] refresh token obtenido correctamente.');
    return page(
      'eBay · token listo',
      `<h1>✅ Token de eBay obtenido</h1>
       <p>Copia este <strong>refresh token</strong> y guárdalo en la variable <code>EBAY_REFRESH_TOKEN</code> del servidor:</p>
       <textarea readonly onclick="this.select()">${escapeHtml(data.refresh_token)}</textarea>
       <div class="box">
         <p>Access token válido por <strong>${Number(data.expires_in ?? 7200)}s</strong>. No hace falta guardarlo: la app lo renueva automáticamente con el refresh token.</p>
         <p>Después de guardar el refresh token, recarga la app y podrás buscar y publicar en eBay.</p>
       </div>`,
    );
  } catch (error) {
    const info = ebayErrorMessage(error);
    console.error(`[ebay] error en /api/ebay/callback (${info.code}):`, error);
    return page(
      'eBay · error',
      `<h1>Error con eBay</h1><p><strong>${info.code}</strong>: ${escapeHtml(info.message)}</p>`,
    );
  }
};

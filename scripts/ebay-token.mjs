#!/usr/bin/env node
/**
 * Intercambia un authorization code de eBay por un access token + refresh token.
 *
 * Uso:
 *   node scripts/ebay-token.mjs "<CODE>" ["<RuName>"]
 *
 * Lee del .env: EBAY_CLIENT_ID, EBAY_CLIENT_SECRET, EBAY_SANDBOX y EBAY_REDIRECT_URI (RuName).
 * El segundo argumento (RuName) es opcional; por defecto usa EBAY_REDIRECT_URI.
 */
import 'dotenv/config';

const rawCode = process.argv[2];
const ruName = (process.argv[3] || process.env.EBAY_REDIRECT_URI || '').trim();

if (!rawCode) {
  console.error('Uso: node scripts/ebay-token.mjs "<AUTHORIZATION_CODE>" ["<RuName>"]');
  console.error('El code aparece en la URL a la que redirige eBay después de aceptar el consentimiento.');
  process.exit(1);
}

let code = rawCode.trim();
try {
  // eBay devuelve el code URL-encoded en la redirect_uri; lo decodificamos antes de reenviarlo.
  if (code.includes('%')) code = decodeURIComponent(code);
} catch {
  // Si ya viene decodificado, se usa tal cual.
}

const clientId = (process.env.EBAY_CLIENT_ID ?? '').trim();
const clientSecret = (process.env.EBAY_CLIENT_SECRET ?? '').trim();
const sandbox = (process.env.EBAY_SANDBOX ?? 'true') !== 'false';
const base = sandbox ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com';

if (!clientId || !clientSecret) {
  console.error('[ebay] Faltan EBAY_CLIENT_ID o EBAY_CLIENT_SECRET en el .env');
  process.exit(1);
}
if (!ruName) {
  console.error('[ebay] Falta el RuName. Pásalo como segundo argumento o define EBAY_REDIRECT_URI.');
  process.exit(1);
}

const body = new URLSearchParams({
  grant_type: 'authorization_code',
  code,
  redirect_uri: ruName,
});

const response = await fetch(`${base}/identity/v1/oauth2/token`, {
  method: 'POST',
  headers: {
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: body.toString(),
});

const text = await response.text();
if (!response.ok) {
  console.error(`[ebay] eBay respondió ${response.status}: ${text}`);
  process.exit(1);
}

const data = JSON.parse(text);
console.log('\n✅ Token obtenido correctamente\n');
console.log('Refresh token (guárdalo en EBAY_REFRESH_TOKEN del .env):');
console.log(data.refresh_token ?? '(no devuelto)');
console.log('\nAccess token (válido ' + (data.expires_in ?? 7200) + 's):');
console.log(data.access_token ?? '(no devuelto)');
console.log('\nEl refresh token expira en ' + (data.refresh_token_expires_in ?? '?') + 's\n');

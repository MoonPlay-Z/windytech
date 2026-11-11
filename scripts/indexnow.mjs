/**
 * Avisa a IndexNow (Bing, Yandex, Seznam, Naver y Brave Search) que las URLs
 * del sitemap cambiaron. Ejecuta `npm run build` antes y luego:
 *
 *   npm run indexnow
 *
 * La clave debe coincidir con el archivo público /<clave>.txt.
 */
import { readFile } from 'node:fs/promises';

const HOST = 'windytech.studio';
const KEY = '3912b45e618c49a3694bc4c10ff020f4';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const dryRun = process.argv.includes('--dry-run');

const sitemap = await readFile(new URL('../dist/sitemap.xml', import.meta.url), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1].trim())
  .filter((url) => url.startsWith(`https://${HOST}/`));

if (urlList.length === 0) {
  console.error('No se encontraron URLs en dist/sitemap.xml. Ejecuta `npm run build` primero.');
  process.exit(1);
}

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList,
};

if (dryRun) {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});

console.log(`IndexNow: ${response.status} ${response.statusText} (${urlList.length} URLs)`);
if (!response.ok) {
  console.error(await response.text());
  process.exit(1);
}

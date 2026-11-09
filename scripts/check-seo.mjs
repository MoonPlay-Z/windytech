#!/usr/bin/env node
/**
 * Comprobaciones SEO sobre dist/ (sin dependencias externas).
 *
 * Uso:
 *   npm run build && npm run seo:check
 *   node scripts/check-seo.mjs --site=https://www.windytech.studio   # valida el sitio live
 *
 * Revisa: sitemap generado, canonical, hreflang, títulos y descripciones únicos,
 * un solo H1 por página, JSON-LD parseable, imágenes y enlaces internos rotos.
 */
import { readFile, readdir, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const siteArg = process.argv.find((arg) => arg.startsWith('--site='));
const site = siteArg ? siteArg.slice('--site='.length).replace(/\/$/, '') : null;

const errors = [];
const warnings = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

async function exists(file) {
  return access(file).then(
    () => true,
    () => false,
  );
}

async function loadHtml() {
  if (site) {
    const res = await fetch(`${site}/sitemap.xml`);
    if (!res.ok) throw new Error(`sitemap.xml respondió ${res.status}`);
    const xml = await res.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const pages = [];
    for (const url of urls) {
      const res = await fetch(url);
      if (!res.ok) {
        errors.push(`[live] ${url} respondió ${res.status}`);
        continue;
      }
      pages.push({ url, html: await res.text() });
    }
    return pages;
  }

  const files = (await walk(dist)).filter((file) => file.endsWith('.html'));
  if (files.length === 0) {
    errors.push('No hay dist/*.html. Ejecuta `npm run build` antes de `npm run seo:check`.');
    return [];
  }
  const pages = [];
  for (const file of files) {
    pages.push({ url: file, html: await readFile(file, 'utf8') });
  }
  return pages;
}

function checkPage(page, { titles, descriptions, canonicals }) {
  const { url, html } = page;
  const label = site ? url : url.replace(dist, '');

  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
  if (!title) errors.push(`${label}: sin <title>`);
  else if (title.length > 65) warnings.push(`${label}: título de ${title.length} caracteres`);
  if (title) {
    if (titles.has(title)) errors.push(`${label}: título duplicado con ${titles.get(title)}`);
    titles.set(title, label);
  }

  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1]?.trim();
  if (!description) errors.push(`${label}: sin meta description`);
  else if (description.length > 165)
    warnings.push(`${label}: description de ${description.length} caracteres`);
  if (description) {
    if (descriptions.has(description))
      errors.push(`${label}: description duplicada con ${descriptions.get(description)}`);
    descriptions.set(description, label);
  }

  const noindex = /<meta name="robots" content="[^"]*noindex/i.test(html);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!noindex && !canonical) errors.push(`${label}: sin canonical`);
  if (canonical) {
    if (canonicals.has(canonical))
      errors.push(`${label}: canonical duplicado con ${canonicals.get(canonical)}`);
    canonicals.set(canonical, label);
    if (site && !canonical.startsWith(site)) warnings.push(`${label}: canonical fuera del dominio`);
  }

  const h1s = [...html.matchAll(/<h1[\s>]/g)];
  if (h1s.length !== 1) errors.push(`${label}: ${h1s.length} etiquetas H1 (se espera 1)`);

  if (!noindex) {
    const langs = new Set(
      [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map((m) => m[1]),
    );
    if (!langs.has('es') || !langs.has('en'))
      errors.push(`${label}: faltan alternates hreflang es/en`);
  }

  const scripts = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
  ];
  for (const [, raw] of scripts) {
    try {
      JSON.parse(raw);
    } catch (error) {
      errors.push(`${label}: JSON-LD inválido (${error.message})`);
    }
  }
}

async function checkAssets(page) {
  if (site) return;
  const { url, html } = page;
  const label = url.replace(dist, '');
  const refs = new Set();
  for (const match of html.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
    const ref = match[1].split('#')[0].split('?')[0];
    if (/\.(png|webp|jpe?g|gif|svg|ico|woff2?|css|js)$/i.test(ref)) refs.add(ref);
  }
  for (const ref of refs) {
    if (!(await exists(join(dist, ref)))) errors.push(`${label}: recurso roto ${ref}`);
  }
}

const pages = await loadHtml();
const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();

for (const page of pages) {
  checkPage(page, { titles, descriptions, canonicals });
  await checkAssets(page);
}

if (!site) {
  const sitemap = join(dist, 'sitemap.xml');
  if (!(await exists(sitemap))) {
    errors.push('No existe dist/sitemap.xml: ejecuta `npm run sitemap` o `npm run build`.');
  } else {
    const xml = await readFile(sitemap, 'utf8');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    if (locs.length === 0) errors.push('sitemap.xml sin URLs');
    for (const loc of locs) {
      const path = new URL(loc).pathname;
      const candidates = [join(dist, path, 'index.html'), join(dist, path)];
      const found = await Promise.all(candidates.map(exists));
      if (!found.some(Boolean)) errors.push(`sitemap.xml incluye una URL sin página: ${loc}`);
    }
    console.log(`[seo] sitemap: ${locs.length} URLs`);
  }
}

console.log(
  `[seo] ${pages.length} páginas revisadas · ${errors.length} errores · ${warnings.length} avisos`,
);
for (const warning of warnings) console.warn(`  aviso: ${warning}`);
for (const error of errors) console.error(`  error: ${error}`);
process.exit(errors.length > 0 ? 1 : 0);

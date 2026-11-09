#!/usr/bin/env node
/**
 * Genera dist/sitemap.xml a partir del HTML ya construido.
 *
 * No hay lista de URLs escrita a mano: recorre dist/, lee el <link rel="canonical">
 * y los <link rel="alternate" hreflang> de cada página, ignora las que llevan
 * noindex y escribe un sitemap con alternates ES/EN. Al añadir una página nueva
 * basta con que BaseLayout reciba `path` y `altPath`; el sitemap se actualiza solo.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.name === 'index.html') files.push(full);
  }
  return files;
}

function lastCommitDate() {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
  } catch {
    return null;
  }
}

const escapeXml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const files = await walk(dist).catch(() => []);
if (files.length === 0) {
  console.error('[sitemap] No hay dist/ todavía. Ejecuta `npm run build` primero.');
  process.exit(1);
}

const lastmod = lastCommitDate() ?? new Date().toISOString().slice(0, 10);
const pages = [];

for (const file of files) {
  const html = await readFile(file, 'utf8');
  if (/<meta name="robots" content="[^"]*noindex/i.test(html)) continue;

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical) continue;

  const alternates = new Map();
  const re = /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g;
  for (const match of html.matchAll(re)) {
    if (match[1] === 'x-default') continue;
    alternates.set(match[1], match[2]);
  }

  const distPath = relative(dist, file);
  pages.push({
    loc: canonical,
    file: distPath.split(sep).join('/'),
    alternates: [...alternates.entries()].sort(([a], [b]) => a.localeCompare(b)),
  });
}

pages.sort((a, b) => a.loc.length - b.loc.length || a.loc.localeCompare(b.loc));

const body = pages
  .map(({ loc, alternates }) => {
    const links = alternates
      .map(
        ([hreflang, href]) =>
          `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}"/>`,
      )
      .join('\n');
    return [
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      links,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n');
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;

await writeFile(join(dist, 'sitemap.xml'), xml, 'utf8');
console.log(`[sitemap] ${pages.length} URLs escritas en dist/sitemap.xml (lastmod ${lastmod})`);

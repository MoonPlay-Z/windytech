#!/usr/bin/env tsx
/**
 * Genera el sitemap del sitio.
 *
 * El sitio se renderiza bajo demanda (output: 'server'), así que no hay HTML
 * prerenderizado que recorrer: las URLs se sacan de las rutas estáticas,
 * de los servicios definidos en src/data/services.ts y de las tablas del
 * catálogo (productos, publicaciones y proyectos).
 *
 * El archivo se escribe en dist/client/sitemap.xml, que es la carpeta que el
 * adaptador Node sirve como archivos estáticos.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import pg from 'pg';
import { services } from '../src/data/services';
import { CITIES } from '../src/data/ciudades';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, 'dist', 'client');
const siteUrl = (process.env.PUBLIC_SITE_URL || 'https://windytech.studio').replace(/\/$/, '');

type Entry = {
  /** Ruta en español (único idioma del sitio). */
  path: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
  lastmod?: string;
};

/** Rutas fijas del sitio (con su equivalente en inglés). */
const staticRoutes: Entry[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/servicios/', changefreq: 'weekly', priority: '0.9' },
  { path: '/catalogo/', changefreq: 'daily', priority: '0.9' },
  { path: '/proyectos/', changefreq: 'weekly', priority: '0.8' },
  { path: '/blog/', changefreq: 'weekly', priority: '0.8' },
  { path: '/nosotros/', changefreq: 'monthly', priority: '0.6' },
  { path: '/legal/privacidad/', changefreq: 'yearly', priority: '0.3' },
  { path: '/legal/terminos/', changefreq: 'yearly', priority: '0.3' },
  { path: '/carrito/', changefreq: 'yearly', priority: '0.3' },
];

/** Servicios (páginas de detalle) definidos en el código. */
const serviceRoutes: Entry[] = services.map((service) => ({
  path: service.path,
  changefreq: 'monthly',
  priority: '0.8',
}));

// Páginas locales por ciudad (SEO local).
const cityRoutes: Entry[] = CITIES.map((city) => ({
  path: `/${city.slug}/`,
  changefreq: 'monthly',
  priority: '0.7',
}));

function lastCommitDate(): string {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : new Date().toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

type DbEntry = { path: string; lastmod?: string };

/** Productos, publicaciones y proyectos que existen ahora mismo en la base. */
async function dynamicRoutes(): Promise<DbEntry[]> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn('[sitemap] Sin DATABASE_URL: se omite el contenido dinámico.');
    return [];
  }

  const pool = new pg.Pool({ connectionString: databaseUrl, max: 1 });
  const entries: DbEntry[] = [];

  try {
    const products = await pool.query<{ locale: string; slug: string; updated_at: Date }>(
      `SELECT t.locale, t.slug, p.updated_at
         FROM product_translations t
         JOIN products p ON p.id = t.product_id
        WHERE p.is_active = true`,
    );
    const byProduct = new Map<string, { path?: string; lastmod?: string }>();
    for (const row of products.rows) {
      const key = row.slug;
      const item = byProduct.get(key) ?? {};
      if (row.locale === 'es') item.path = `/catalogo/${row.slug}/`;
      item.lastmod = row.updated_at?.toISOString().slice(0, 10);
      byProduct.set(key, item);
    }
    for (const item of byProduct.values()) {
      if (item.path) entries.push({ path: item.path, lastmod: item.lastmod });
    }

    const posts = await pool.query<{ locale: string; slug: string; updated_at: Date; published_at: Date | null }>(
      `SELECT t.locale, t.slug, p.updated_at, p.published_at
         FROM post_translations t
         JOIN posts p ON p.id = t.post_id
        WHERE p.is_published = true`,
    );
    const byPost = new Map<string, { path?: string; lastmod?: string }>();
    for (const row of posts.rows) {
      const item = byPost.get(row.slug) ?? {};
      if (row.locale === 'es') item.path = `/blog/${row.slug}/`;
      item.lastmod = (row.published_at ?? row.updated_at)?.toISOString().slice(0, 10);
      byPost.set(row.slug, item);
    }
    for (const item of byPost.values()) {
      if (item.path) entries.push({ path: item.path, lastmod: item.lastmod });
    }

    const projects = await pool.query<{ locale: string; slug: string; updated_at: Date }>(
      `SELECT t.locale, t.slug, p.updated_at
         FROM project_translations t
         JOIN projects p ON p.id = t.project_id
        WHERE p.is_published = true`,
    );
    const byProject = new Map<string, { path?: string; lastmod?: string }>();
    for (const row of projects.rows) {
      const item = byProject.get(row.slug) ?? {};
      if (row.locale === 'es') item.path = `/proyectos/${row.slug}/`;
      item.lastmod = row.updated_at?.toISOString().slice(0, 10);
      byProject.set(row.slug, item);
    }
    for (const item of byProject.values()) {
      if (item.path) entries.push({ path: item.path, lastmod: item.lastmod });
    }
  } catch (error) {
    console.warn('[sitemap] No se pudieron leer las tablas:', (error as Error).message);
  } finally {
    await pool.end();
  }

  return entries;
}

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const fallbackLastmod = lastCommitDate();

const entries: Entry[] = [
  ...staticRoutes,
  ...serviceRoutes,
  ...cityRoutes,
  ...(await dynamicRoutes()).map((item) => ({
    path: item.path,
    changefreq: 'weekly' as const,
    priority: '0.7',
    lastmod: item.lastmod ?? fallbackLastmod,
  })),
];

const seen = new Set<string>();
const unique = entries.filter((entry) => {
  if (seen.has(entry.path)) return false;
  seen.add(entry.path);
  return true;
});

// El sitio es solo en español: no hay alternates hreflang en el sitemap.
const body = unique
  .map((entry) => {
    const url = new URL(entry.path, siteUrl).toString();
    return [
      '  <url>',
      `    <loc>${escapeXml(url)}</loc>`,
      `    <lastmod>${entry.lastmod ?? fallbackLastmod}</lastmod>`,
      `    <changefreq>${entry.changefreq}</changefreq>`,
      `    <priority>${entry.priority}</priority>`,
      '  </url>',
    ].join('\n');
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, 'sitemap.xml'), xml, 'utf8');
console.log(`[sitemap] ${unique.length} URLs escritas en dist/client/sitemap.xml`);

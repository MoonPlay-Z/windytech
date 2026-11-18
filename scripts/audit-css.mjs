/**
 * Auditoría de clases CSS: detecta reglas huérfanas (CSS sin uso en plantillas)
 * y clases de plantilla sin regla CSS (contenedores sin estilo).
 *
 * Uso: npm run css:audit
 *
 * Las clases generadas dinámicamente (por ejemplo `is-${estado}` o
 * `icon-badge--${icon}`) se reconocen automáticamente como usadas: se detecta
 * el prefijo dinámico en el código y se comprueba que el sufijo aparece en los
 * datos. No hace falta añadirlas a una lista blanca.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = join(ROOT, 'src');
const STYLES = join(SRC, 'styles');
const EXTENSIONS = ['.astro', '.ts', '.tsx', '.js', '.mjs', '.html'];

function walk(dir, exts) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full, exts));
    } else if (exts.some((ext) => entry.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, ' ');
}

function stripStrings(css) {
  return css.replace(/"[^"\n]*"/g, '""').replace(/'[^'\n]*'/g, "''");
}

/* --- 1. Clases definidas en CSS ------------------------------------------- */
const cssClasses = new Map(); // clase -> ubicaciones "archivo:línea"
for (const file of walk(STYLES, ['.css'])) {
  const clean = stripStrings(stripComments(readFileSync(file, 'utf8')));
  clean.split('\n').forEach((line, index) => {
    for (const match of line.matchAll(/\.([A-Za-z_][\w-]*)/g)) {
      const name = match[1];
      if (!cssClasses.has(name)) cssClasses.set(name, []);
      cssClasses.get(name).push(`${relative(ROOT, file)}:${index + 1}`);
    }
  });
}

/* --- 2. Código fuente (plantillas y scripts) ------------------------------ */
const sourceFiles = walk(SRC, EXTENSIONS);
const sources = new Map(
  sourceFiles.map((file) => [file, readFileSync(file, 'utf8')]),
);
const allSource = [...sources.values()].join('\n');

/* --- 3. Prefijos dinámicos ------------------------------------------------- */
const dynamicPrefixes = new Set();
const hasDynamicState = /\bis-\$\{/.test(allSource);
const dynamicRegex = /\b([A-Za-z][\w-]*--)\$\{/g;
for (const match of allSource.matchAll(dynamicRegex)) {
  dynamicPrefixes.add(match[1]);
}

function isUsed(name) {
  // Coincidencia literal en cualquier plantilla/script (class, classList,
  // props, selectores de datos, etc.).
  if (new RegExp('\\b' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(allSource)) {
    return true;
  }
  // Clase de estado generada con `is-${...}`.
  if (hasDynamicState && name.startsWith('is-')) return true;
  // Variante generada con `prefijo--${valor}`: el sufijo debe existir en datos.
  for (const prefix of dynamicPrefixes) {
    if (name.startsWith(prefix)) {
      const suffix = name.slice(prefix.length);
      if (new RegExp('\\b' + suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(allSource)) {
        return true;
      }
    }
  }
  return false;
}

/* --- 4. Clases usadas en plantillas --------------------------------------- */
const templateClasses = new Map(); // clase -> archivos
for (const [file, text] of sources) {
  if (!file.endsWith('.astro')) continue;
  const buckets = [];
  for (const m of text.matchAll(/\bclass\s*=\s*"([^"]*)"/g)) buckets.push(m[1]);
  for (const m of text.matchAll(/\bclass\s*=\s*'([^']*)'/g)) buckets.push(m[1]);
  for (const m of text.matchAll(/\bclass\s*=\s*\{`([^`]*)`\}/g)) buckets.push(m[1]);
  for (const m of text.matchAll(/\bclass:list=\{\[([\s\S]*?)\]\}/g)) {
    // Solo elementos literales: ignora condicionales, objetos y plantillas
    // (sus clases dinámicas ya se cubren con los prefijos detectados).
    for (const part of m[1].split(',')) {
      const literal = part.trim().replace(/^\[|\]$/g, '').trim().match(/^(['"])([^'"]+)\1$/);
      if (literal) buckets.push(literal[2]);
    }
  }
  for (const bucket of buckets) {
    for (const token of bucket.split(/\s+/)) {
      if (!/^[A-Za-z_][\w-]*$/.test(token)) continue;
      if (!templateClasses.has(token)) templateClasses.set(token, new Set());
      templateClasses.get(token).add(relative(ROOT, file));
    }
  }
}

/* --- 5. Resultados -------------------------------------------------------- */
const orphans = [];
for (const [name, locations] of cssClasses) {
  if (!isUsed(name)) orphans.push({ name, locations });
}

const unstyled = [];
for (const [name, files] of templateClasses) {
  if (cssClasses.has(name)) continue;
  if (name.endsWith('--') || name.startsWith('is-')) continue; //artefactos dinámicos
  if ([...dynamicPrefixes].some((prefix) => name.startsWith(prefix))) continue;
  unstyled.push({ name, files: [...files] });
}

if (orphans.length === 0 && unstyled.length === 0) {
  console.log(`✔ CSS OK: ${cssClasses.size} clases definidas, todas usadas y con estilo.`);
  process.exit(0);
}

if (orphans.length) {
  console.log(`✖ ${orphans.length} clase(s) CSS sin uso:`);
  for (const { name, locations } of orphans) {
    console.log(`  .${name.padEnd(34)} ${locations.slice(0, 5).join(', ')}`);
  }
}
if (unstyled.length) {
  console.log(`✖ ${unstyled.length} clase(s) de plantilla sin regla CSS:`);
  for (const { name, files } of unstyled) {
    console.log(`  .${name.padEnd(34)} ${files.slice(0, 5).join(', ')}`);
  }
}
process.exit(1);

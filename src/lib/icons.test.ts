import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ICONS } from './icons';

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..');

async function collectAstroFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await collectAstroFiles(full)));
    else if (entry.name.endsWith('.astro')) files.push(full);
  }
  return files;
}

test('el registro de iconos no tiene nombres repetidos', () => {
  const names = Object.keys(ICONS);
  assert.equal(new Set(names).size, names.length);
});

test('todos los iconos de las plantillas existen en el registro', async () => {
  const files = await collectAstroFiles(srcDir);
  const used = new Set<string>();

  for (const file of files) {
    const html = await readFile(file, 'utf8');
    for (const match of html.matchAll(/<Icon\s+name="([a-z0-9-]+)"/g)) {
      used.add(match[1]);
    }
  }

  const missing = [...used].filter((name) => !(name in ICONS)).sort();
  assert.deepEqual(
    missing,
    [],
    `Iconos sin registrar: ${missing.join(', ')}. Añádelos en src/lib/icons.ts`,
  );
});

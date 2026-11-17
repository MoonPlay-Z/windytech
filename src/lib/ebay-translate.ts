/**
 * Traducción automática a español de los textos que llegan desde eBay.
 *
 * Usa el endpoint público de Google Translate (`client=gtx`) sin API key:
 * `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=...`
 *
 * Si la traducción falla se devuelve el texto original: el flujo de importación
 * no debe romperse por un fallo del servicio de traducción.
 */

const GOOGLE_TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single';
const SOURCE_LANGUAGE = 'en';
const TARGET_LANGUAGE = 'es';
const MAX_CHUNK_LENGTH = 4500;

/** Extrae la primera cadena traducida del payload de respuesta de Google. */
export function parseTranslationResponse(data: unknown): string | null {
  const visit = (value: unknown): string | null => {
    if (typeof value === 'string') {
      const text = value.trim();
      return text.length > 0 ? text : null;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = visit(item);
        if (found) return found;
      }
    }
    return null;
  };
  return visit(data);
}

/** Divide el texto en chunks que no superen el máximo de caracteres. */
export function chunkText(text: string, max: number = MAX_CHUNK_LENGTH): string[] {
  const clean = (text ?? '').trim();
  if (!clean) return [];
  if (clean.length <= max) return [clean];

  const lines = clean.split('\n');
  const groups: string[] = [];
  let current = '';
  for (const line of lines) {
    const candidate = current ? `${current}\n${line}` : line;
    if (candidate.length > max && current) {
      groups.push(current);
      current = line;
    } else {
      current = candidate;
    }
  }
  if (current) groups.push(current);

  const chunks: string[] = [];
  for (const group of groups) {
    if (group.length <= max) {
      if (group.trim()) chunks.push(group);
      continue;
    }
    // Un fragmento más largo que el máximo se corta por caracteres.
    let rest = group;
    while (rest.length > max) {
      chunks.push(rest.slice(0, max));
      rest = rest.slice(max);
    }
    if (rest.trim()) chunks.push(rest);
  }
  return chunks;
}

async function translateChunk(chunk: string): Promise<string> {
  const url = new URL(GOOGLE_TRANSLATE_URL);
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', SOURCE_LANGUAGE);
  url.searchParams.set('tl', TARGET_LANGUAGE);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', chunk);
  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Google Translate falló (${response.status}) para: ${chunk.slice(0, 60)}`);
  }
  const data = (await response.json()) as unknown;
  const translated = parseTranslationResponse(data);
  if (!translated) throw new Error('Google Translate no devolvió traducción.');
  return translated;
}

/** Traduce un texto del inglés al español usando Google Translate. */
export async function translateToSpanish(text: string): Promise<string> {
  const clean = (text ?? '').trim();
  if (!clean) return '';
  const chunks = chunkText(clean);
  const translatedChunks: string[] = [];
  for (const chunk of chunks) {
    translatedChunks.push(await translateChunk(chunk));
  }
  return translatedChunks.join('\n');
}

/**
 * Traduce la descripción de un item de eBay al español. Si falla devuelve el
 * texto original.
 */
export async function translateEbayText(text: string): Promise<string> {
  const clean = (text ?? '').trim();
  if (!clean) return '';
  try {
    const translated = await translateToSpanish(clean);
    return translated.trim() || clean;
  } catch (error) {
    console.error('[ebay-translate] no se pudo traducir la descripción; se usa el texto original:', error);
    return clean;
  }
}

/**
 * Traduce el título de un item de eBay al español. Si falla devuelve el original.
 */
export async function translateEbayTitle(title: string): Promise<string> {
  const clean = (title ?? '').trim().slice(0, 180);
  if (!clean) return '';
  const translated = await translateEbayText(clean);
  return translated.trim().slice(0, 180);
}

/** Etiquetas en español para las claves de especificaciones de eBay. */
const SPEC_KEY_LABELS: Record<string, string> = {
  brand: 'Marca',
  model: 'Modelo',
  condition: 'Condición',
  screen: 'Pantalla',
  storage: 'Almacenamiento',
  ram: 'RAM',
  memory: 'Memoria',
  processor: 'Procesador',
  gpu: 'Gráfica',
};

/** Traduce la clave de una especificación al español (valores técnicos se conservan). */
export function translateSpecKey(key: string): string {
  const normalized = key.trim().toLowerCase();
  return SPEC_KEY_LABELS[normalized] ?? key.trim();
}

/**
 * Traduce las especificaciones de un item de eBay: claves a español y valores
 * mediante el traductor. Si falla conserva los valores originales.
 */
export async function translateEbaySpecs(specs?: Record<string, string> | null): Promise<Record<string, string>> {
  if (!specs) return {};
  const translated: Record<string, string> = {};
  for (const [key, value] of Object.entries(specs)) {
    const label = translateSpecKey(key);
    const originalValue = value ?? '';
    const translatedValue = originalValue.trim() ? await translateEbayText(originalValue) : originalValue;
    translated[label] = translatedValue;
  }
  return translated;
}

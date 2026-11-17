/**
 * Utilidades de texto para metadatos.
 */

/**
 * Recorta un texto para usarlo como meta descripción sin cortar palabras.
 * Los buscadores muestran ~155-160 caracteres; el resto se pierde y además
 * diluye la palabra clave principal.
 */
export function truncateText(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;

  // Se corta un carácter extra para poder retroceder hasta el último espacio.
  const slice = clean.slice(0, max + 1);
  const lastSpace = slice.lastIndexOf(' ');
  const end = lastSpace > max * 0.6 ? lastSpace : max;
  return `${clean.slice(0, end).replace(/[\s,;:.\-–—]+$/, '')}…`;
}

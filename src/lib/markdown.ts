import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

marked.setOptions({ gfm: true, breaks: true });

/** Markdown del panel → HTML seguro. Nunca se confía en HTML pegado. */
export function renderMarkdown(markdown: string | null | undefined): string {
  if (!markdown) return '';
  const raw = marked.parse(markdown, { async: false }) as string;
  return sanitizeHtml(raw, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h2', 'h3', 'h4',
      'blockquote', 'code', 'pre', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'rel', 'target'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: 'noopener noreferrer', target: '_blank' },
      }),
    },
  });
}

export function stripMarkdown(markdown: string | null | undefined, max = 180): string {
  if (!markdown) return '';
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

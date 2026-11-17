import type { APIRoute } from 'astro';
import { blogPath } from '../../lib/catalog';
import { imageUrl } from '../../lib/cloudinary';
import { getPosts } from '../../lib/db/queries';
import { site } from '../../data/site';

export const prerender = false;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const cdata = (value: string) => `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

/**
 * Feed RSS del blog.
 *
 * Sirve para que los lectores RSS y las herramientas de automatización
 * (Make, Zapier, Buffer, IFTTT...) detecten cada publicación nueva y la puedan
 * compartir en redes sociales sin trabajo manual.
 */
export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const listHref = new URL(blogPath(), site.url).toString();
  const feedUrl = new URL('/blog/rss.xml', site.url).toString();
  const lastBuildDate = new Date().toUTCString();

  const items = posts
    .map((post) => {
      const link = new URL(`${blogPath()}${post.slug}/`, site.url).toString();
      const cover = post.coverPublicId
        ? imageUrl(post.coverPublicId, { width: 1200, crop: 'fill', aspectRatio: '16:9' })
        : '';
      const published = post.publishedAt ? new Date(post.publishedAt) : new Date();
      const description = [
        `<p>${escapeXml(post.excerpt)}</p>`,
        cover
          ? `<p><img src="${escapeXml(cover)}" alt="${escapeXml(post.title)}" /></p>`
          : '',
      ].join('');

      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${published.toUTCString()}</pubDate>`,
        `      <dc:creator>${escapeXml(post.author || site.name)}</dc:creator>`,
        `      <description>${cdata(description)}</description>`,
        ...(cover
          ? [
              `      <media:content url="${escapeXml(cover)}" medium="image" type="image/webp" />`,
            ]
          : []),
        ...post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`),
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Blog de ${escapeXml(site.name)}</title>
    <link>${escapeXml(listHref)}</link>
    <description>${escapeXml(`${site.slogan}. Artículos sobre software, automatización, web y equipos.`)}</description>
    <language>es-VE</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>Astro</generator>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
    },
  });
};

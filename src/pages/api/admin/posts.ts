import type { APIRoute } from 'astro';
import { postSchema, fieldErrors } from '../../../lib/validation';
import {
  deletePost,
  listPostsAdmin,
  postSlugInUse,
  savePost,
  writeAudit,
} from '../../../lib/db/queries';
import { destroyAsset } from '../../../lib/cloudinary';
import { json, readJson, requireAdmin } from '../../../lib/api';
import { sameOrigin } from '../../../lib/security';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  return json({ posts: await listPostsAdmin() }, 200, { 'Cache-Control': 'no-store' });
};

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const parsed = postSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ error: 'Datos inválidos.', fields: fieldErrors(parsed.error) }, 422);
  }

  const data = parsed.data;
  const publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;

  // El slug es único por idioma: avisa antes de tocar la base de datos.
  for (const translation of data.translations) {
    if (await postSlugInUse(translation.locale, translation.slug, data.id ?? null)) {
      return json(
        {
          error: `El slug "${translation.slug}" ya lo usa otra publicación.`,
          fields: { [`translations.${translation.locale}.slug`]: ['Slug duplicado.'] },
        },
        422,
      );
    }
  }

  let id: number | null;
  try {
    id = await savePost({
      id: data.id,
      coverPublicId: data.coverPublicId ?? null,
      author: data.author,
      tags: data.tags,
      publishedAt: publishedAt && Number.isFinite(publishedAt.getTime()) ? publishedAt : null,
      isPublished: data.isPublished,
      translations: data.translations,
    });
  } catch (error) {
    console.error('[admin] no se pudo guardar la publicación:', error);
    return json(
      { error: 'No se pudo guardar la publicación. Revisa los datos e inténtalo de nuevo.' },
      500,
    );
  }

  if (!id) return json({ error: 'No se pudo guardar la publicación.' }, 503);
  await writeAudit(admin.id, data.id ? 'UPDATE' : 'CREATE', 'posts', String(id), { title: data.translations[0]?.title });
  return json({ ok: true, id });
};

export const DELETE: APIRoute = async ({ request, url }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  const id = Number(url.searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'Id inválido.' }, 400);
  const cover = url.searchParams.get('cover');
  await deletePost(id);
  if (cover) await destroyAsset(cover);
  await writeAudit(admin.id, 'DELETE', 'posts', String(id), null);
  return json({ ok: true });
};

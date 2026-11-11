import type { APIRoute } from 'astro';
import { postSchema } from '../../../lib/validation';
import { deletePost, listPostsAdmin, savePost, writeAudit } from '../../../lib/db/queries';
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
    return json({ error: 'Datos inválidos.', fields: parsed.error.flatten().fieldErrors }, 422);
  }

  const data = parsed.data;
  const publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;

  const id = await savePost({
    id: data.id,
    coverPublicId: data.coverPublicId ?? null,
    author: data.author,
    tags: data.tags,
    publishedAt: publishedAt && Number.isFinite(publishedAt.getTime()) ? publishedAt : null,
    isPublished: data.isPublished,
    translations: data.translations,
  });

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

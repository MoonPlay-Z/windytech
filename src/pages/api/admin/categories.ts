import type { APIRoute } from 'astro';
import { categorySchema, fieldErrors } from '../../../lib/validation';
import { deleteCategory, listCategoriesAdmin, saveCategory, writeAudit } from '../../../lib/db/queries';
import { json, readJson, requireAdmin } from '../../../lib/api';
import { sameOrigin } from '../../../lib/security';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  return json({ categories: await listCategoriesAdmin() }, 200, { 'Cache-Control': 'no-store' });
};

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const parsed = categorySchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ error: 'Datos inválidos.', fields: fieldErrors(parsed.error) }, 422);
  }

  const id = await saveCategory({
    ...parsed.data,
    imagePublicId: parsed.data.imagePublicId ?? null,
  });
  if (!id) return json({ error: 'No se pudo guardar la categoría.' }, 503);
  await writeAudit(admin.id, parsed.data.id ? 'UPDATE' : 'CREATE', 'categories', String(id), null);
  return json({ ok: true, id });
};

export const DELETE: APIRoute = async ({ request, url }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  const id = Number(url.searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'Id inválido.' }, 400);
  await deleteCategory(id);
  await writeAudit(admin.id, 'DELETE', 'categories', String(id), null);
  return json({ ok: true });
};

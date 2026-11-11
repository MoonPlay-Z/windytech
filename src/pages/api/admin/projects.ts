import type { APIRoute } from 'astro';
import { projectSchema, fieldErrors } from '../../../lib/validation';
import { deleteProject, listProjectsAdmin, saveProject, writeAudit } from '../../../lib/db/queries';
import { destroyAsset } from '../../../lib/cloudinary';
import { json, readJson, requireAdmin } from '../../../lib/api';
import { sameOrigin } from '../../../lib/security';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  return json({ projects: await listProjectsAdmin() }, 200, { 'Cache-Control': 'no-store' });
};

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const parsed = projectSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ error: 'Datos inválidos.', fields: fieldErrors(parsed.error) }, 422);
  }

  const data = parsed.data;
  // Un caso sin permiso del cliente no puede publicarse.
  const isPublished = data.isPublished && data.clientApproved;

  const id = await saveProject({
    id: data.id,
    year: data.year ?? null,
    clientName: data.clientName,
    clientApproved: data.clientApproved,
    services: data.services,
    coverPublicId: data.coverPublicId ?? null,
    isPublished,
    sortOrder: data.sortOrder,
    translations: data.translations,
    images: data.images,
  });

  if (!id) return json({ error: 'No se pudo guardar el proyecto.' }, 503);
  await writeAudit(admin.id, data.id ? 'UPDATE' : 'CREATE', 'projects', String(id), {
    clientApproved: data.clientApproved,
    isPublished,
  });
  return json({ ok: true, id, isPublished });
};

export const DELETE: APIRoute = async ({ request, url }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  const id = Number(url.searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'Id inválido.' }, 400);
  const cover = url.searchParams.get('cover');
  await deleteProject(id);
  if (cover) await destroyAsset(cover);
  await writeAudit(admin.id, 'DELETE', 'projects', String(id), null);
  return json({ ok: true });
};

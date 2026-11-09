import type { APIRoute } from 'astro';
import { promotionSchema } from '../../../lib/validation';
import { deletePromotion, listPromotionsAdmin, savePromotion, writeAudit } from '../../../lib/db/queries';
import { json, readJson, requireAdmin } from '../../../lib/api';

export const prerender = false;

function parseDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export const GET: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  return json({ promotions: await listPromotionsAdmin() }, 200, { 'Cache-Control': 'no-store' });
};

export const POST: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const parsed = promotionSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ error: 'Datos inválidos.', fields: parsed.error.flatten().fieldErrors }, 422);
  }

  const data = parsed.data;
  const startsAt = parseDate(data.startsAt);
  if (!startsAt) return json({ error: 'La fecha de inicio es inválida.' }, 422);

  const id = await savePromotion({
    id: data.id,
    name: data.name,
    type: data.type,
    value: data.type === 'FIXED' ? Math.round(data.value * 100) : data.value,
    startsAt,
    endsAt: parseDate(data.endsAt),
    isActive: data.isActive,
    priority: data.priority,
    badgeEs: data.badgeEs,
    badgeEn: data.badgeEn,
    productIds: data.productIds,
    categoryIds: data.categoryIds,
  });

  if (!id) return json({ error: 'No se pudo guardar la promoción.' }, 503);
  await writeAudit(admin.id, data.id ? 'UPDATE' : 'CREATE', 'promotions', String(id), { name: data.name });
  return json({ ok: true, id });
};

export const DELETE: APIRoute = async ({ request, url }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  const id = Number(url.searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'Id inválido.' }, 400);
  await deletePromotion(id);
  await writeAudit(admin.id, 'DELETE', 'promotions', String(id), null);
  return json({ ok: true });
};

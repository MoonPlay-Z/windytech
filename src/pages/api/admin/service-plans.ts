import type { APIRoute } from 'astro';
import { servicePlanSchema, dollarsToCents, fieldErrors } from '../../../lib/validation';
import {
  deleteServicePlan,
  listServicePlansAdmin,
  saveServicePlan,
  servicePlanSlugInUse,
  writeAudit,
} from '../../../lib/db/queries';
import { json, readJson, requireAdmin } from '../../../lib/api';
import { sameOrigin } from '../../../lib/security';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  return json({ plans: await listServicePlansAdmin() }, 200, { 'Cache-Control': 'no-store' });
};

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const parsed = servicePlanSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ error: 'Datos inválidos.', fields: fieldErrors(parsed.error) }, 422);
  }

  const data = parsed.data;

  for (const translation of data.translations) {
    if (await servicePlanSlugInUse(translation.locale, translation.slug, data.id ?? null)) {
      return json(
        {
          error: `El slug "${translation.slug}" ya lo usa otro paquete.`,
          fields: { [`translations.${translation.locale}.slug`]: ['Slug duplicado.'] },
        },
        422,
      );
    }
  }

  let id: number | null;
  try {
    id = await saveServicePlan({
      id: data.id,
      serviceKey: data.serviceKey,
      priceCents: dollarsToCents(data.price),
      currency: data.currency,
      billingPeriod: data.billingPeriod,
      deliveryTime: data.deliveryTime,
      badge: data.badge,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      sortOrder: data.sortOrder,
      translations: data.translations,
    });
  } catch (error) {
    console.error('[admin] no se pudo guardar el paquete:', error);
    return json(
      { error: 'No se pudo guardar el paquete. Revisa los datos e inténtalo de nuevo.' },
      500,
    );
  }

  if (!id) return json({ error: 'No se pudo guardar el paquete.' }, 503);
  await writeAudit(admin.id, data.id ? 'UPDATE' : 'CREATE', 'service_plans', String(id), {
    name: data.translations[0]?.name,
    price: data.price,
  });
  return json({ ok: true, id });
};

export const DELETE: APIRoute = async ({ request, url }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const id = Number(url.searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'Id inválido.' }, 400);

  await deleteServicePlan(id);
  await writeAudit(admin.id, 'DELETE', 'service_plans', String(id), null);
  return json({ ok: true });
};

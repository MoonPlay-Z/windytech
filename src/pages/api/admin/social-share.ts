import type { APIRoute } from 'astro';
import { destroyAsset } from '../../../lib/cloudinary';
import { fail, json, readJson, requireAdmin } from '../../../lib/api';
import { sameOrigin } from '../../../lib/security';
import { deleteSocialShareCard, listSocialShareCards, saveSocialShareCard, writeAudit } from '../../../lib/db/queries';
import {
  coerceSocialShareConfig,
  getGlobalSocialShare,
  getSocialShareForPage,
  getSocialShareOverride,
  invalidateSocialShareCache,
  socialSharePayloadSchema,
  type SocialShareConfig,
  type SocialShareEntityType,
} from '../../../lib/social-share';
import { fieldErrors } from '../../../lib/validation';
import { services } from '../../../data/services';

export const prerender = false;

function normalizeEntity(type: SocialShareEntityType, raw: string): string | null {
  if (type === 'global') return '';
  if (type === 'product') {
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? String(id) : null;
  }
  const service = services.find((item) => item.content.slug === raw || item.id === raw);
  return service?.content.slug ?? null;
}

function assetIds(config: SocialShareConfig): string[] {
  return [config.imagePublicId, config.logoPublicId, config.backgroundPublicId].filter(
    (value): value is string => Boolean(value),
  );
}

/**
 * Borra los assets que ya no usa ninguna tarjeta. Un mismo logo puede estar
 * compartido entre la tarjeta global y varias específicas; solo se elimina
 * cuando la última referencia desaparece.
 */
async function destroyUnreferenced(ids: string[]): Promise<void> {
  const candidates = [...new Set(ids)].filter(Boolean);
  if (candidates.length === 0) return;

  const rows = await listSocialShareCards();
  const referenced = new Set<string>();
  for (const row of rows) {
    for (const id of assetIds(coerceSocialShareConfig(row.config))) referenced.add(id);
  }

  for (const id of candidates) {
    if (!referenced.has(id)) await destroyAsset(id);
  }
}

export const GET: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const url = new URL(request.url);
  const type = (url.searchParams.get('entityType') ?? 'global') as SocialShareEntityType;
  if (!['global', 'product', 'service'].includes(type)) {
    return fail('Tipo de tarjeta no válido.');
  }
  const entityId = normalizeEntity(type, url.searchParams.get('entityId') ?? '');
  if (entityId === null) return fail('La tarjeta solicitada no existe.');

  const state =
    type === 'global'
      ? await getGlobalSocialShare()
      : await getSocialShareOverride(type, entityId);
  const effective = await getSocialShareForPage(type, entityId);

  return json(
    { config: state.config, exists: state.exists, effective },
    200,
    { 'Cache-Control': 'no-store' },
  );
};

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const parsed = socialSharePayloadSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail('Revisa los datos de la tarjeta.', 400, { fields: fieldErrors(parsed.error) });
  }

  const { config } = parsed.data;
  const entityType = parsed.data.entityType;
  const entityId = normalizeEntity(entityType, parsed.data.entityId);
  if (entityId === null) return fail('La tarjeta solicitada no existe.');

  const previous = await getSocialShareOverride(entityType, entityId);
  const saved = await saveSocialShareCard(entityType, entityId, config);
  if (!saved) {
    return fail('No se pudo guardar la tarjeta. Revisa la conexión con la base de datos.', 503);
  }

  invalidateSocialShareCache();

  if (previous.exists) {
    await destroyUnreferenced(assetIds(previous.config));
  }

  await writeAudit(
    admin.id,
    previous.exists ? 'UPDATE' : 'CREATE',
    'social_share_cards',
    `${entityType}:${entityId}`,
    { before: previous.exists ? previous.config : null, after: config },
  );

  return json({ ok: true, config, exists: true }, 200, { 'Cache-Control': 'no-store' });
};

export const DELETE: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const url = new URL(request.url);
  const type = (url.searchParams.get('entityType') ?? '') as SocialShareEntityType;
  if (!['global', 'product', 'service'].includes(type)) {
    return fail('Tipo de tarjeta no válido.');
  }
  const entityId = normalizeEntity(type, url.searchParams.get('entityId') ?? '');
  if (entityId === null) return fail('La tarjeta solicitada no existe.');

  const previous = await getSocialShareOverride(type, entityId);
  if (!previous.exists) {
    return json({ ok: true, deleted: false }, 200, { 'Cache-Control': 'no-store' });
  }

  const deleted = await deleteSocialShareCard(type, entityId);
  if (!deleted) {
    return fail('No se pudo quitar la tarjeta. Revisa la conexión con la base de datos.', 503);
  }

  invalidateSocialShareCache();
  await destroyUnreferenced(assetIds(previous.config));
  await writeAudit(admin.id, 'DELETE', 'social_share_cards', `${type}:${entityId}`, {
    before: previous.config,
  });

  return json({ ok: true, deleted: true }, 200, { 'Cache-Control': 'no-store' });
};

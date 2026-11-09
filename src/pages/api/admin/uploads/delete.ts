import type { APIRoute } from 'astro';
import { destroyAsset } from '../../../../lib/cloudinary';
import { json, readJson, requireAdmin } from '../../../../lib/api';

export const prerender = false;

export const DELETE: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const body = await readJson<{ publicId?: string }>(request);
  const publicId = (body?.publicId ?? '').trim();
  if (!publicId.startsWith('windytech/')) {
    return json({ error: 'Asset no permitido.' }, 422);
  }

  const ok = await destroyAsset(publicId);
  return json({ ok });
};

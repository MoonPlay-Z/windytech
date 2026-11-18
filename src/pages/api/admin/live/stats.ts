import type { APIRoute } from 'astro';
import { json, requireAdmin } from '../../../../lib/api';
import { countAdminStats } from '../../../../lib/db/queries';

export const prerender = false;

/** Métricas del panel para el sistema de actualización en vivo. */
export const GET: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  return json(await countAdminStats(), 200, {
    'Cache-Control': 'private, no-store',
  });
};

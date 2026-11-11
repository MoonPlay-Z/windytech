import type { APIRoute } from 'astro';
import { cloudinaryConfigured, signUpload } from '../../../../lib/cloudinary';
import { json, readJson, requireAdmin } from '../../../../lib/api';
import { sameOrigin } from '../../../../lib/security';

export const prerender = false;

const ALLOWED = /^windytech\/(productos|proyectos|publicaciones|media)\//;

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  if (!cloudinaryConfigured()) {
    return json(
      {
        error:
          'Cloudinary no está configurado en este entorno. Añade CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en el panel de Render (Environment) y vuelve a desplegar.',
      },
      503,
    );
  }

  const body = await readJson<{ folder?: string }>(request);
  const folder = (body?.folder ?? '').replace(/\/$/, '');
  if (!ALLOWED.test(`${folder}/`)) return json({ error: 'Carpeta no permitida.' }, 422);

  const signature = signUpload(folder);
  if (!signature) return json({ error: 'No se pudo firmar la subida.' }, 503);
  return json(signature, 200, { 'Cache-Control': 'no-store' });
};

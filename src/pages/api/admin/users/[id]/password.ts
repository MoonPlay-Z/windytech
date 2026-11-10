import type { APIRoute } from 'astro';
import { hash } from 'bcryptjs';
import { sessionFromRequest } from '../../../../../lib/auth';
import { requireOwner } from '../../../../../lib/api';
import { json } from '../../../../../lib/api';
import { sameOrigin } from '../../../../../lib/security';
import { randomToken } from '../../../../../lib/security';
import { z } from 'zod';
import {
  findAdminById,
  updateAdminPassword,
  writeAudit,
} from '../../../../../lib/db/queries';

const resetSchema = z.object({
  newPassword: z.string().min(8).max(72).optional(),
});

export const prerender = false;

export const PUT: APIRoute = async ({ params, request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await sessionFromRequest(request);
  if (!admin) return json({ error: 'No hay sesión activa.' }, 401);
  if (!requireOwner(admin)) {
    return json({ error: 'Solo el propietario puede restablecer claves.' }, 403);
  }

  const id = Number(params.id);
  if (!id) return json({ error: 'ID inválido.' }, 400);

  const target = await findAdminById(id);
  if (!target) return json({ error: 'Usuario no encontrado.' }, 404);

  const payload = await request.json();
  const parsed = resetSchema.safeParse(payload);

  let newPassword: string;
  if (parsed.success && parsed.data.newPassword) {
    newPassword = parsed.data.newPassword;
  } else {
    newPassword = randomToken(12);
  }

  const passwordHash = await hash(newPassword, 12);
  await updateAdminPassword(id, passwordHash);
  await writeAudit(admin.id, 'RESET_PASSWORD', 'admin_users', String(id), {});

  return json({ success: true, temporaryPassword: newPassword }, 200);
};

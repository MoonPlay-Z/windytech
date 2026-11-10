import type { APIRoute } from 'astro';
import { compare, hash } from 'bcryptjs';
import { sessionFromRequest } from '../../../lib/auth';
import { json } from '../../../lib/api';
import { sameOrigin } from '../../../lib/security';
import { z } from 'zod';
import {
  findAdminByEmail,
  findAdminByEmailExcludingSelf,
  updateAdminEmail,
  updateAdminPassword,
} from '../../../lib/db/queries';

const profileSchema = z.object({
  email: z.string().trim().email().max(200),
  currentPassword: z.string().min(1).max(200).optional(),
  newPassword: z.string().min(8).max(72).optional(),
});

export const prerender = false;

export const PUT: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await sessionFromRequest(request);
  if (!admin) return json({ error: 'No hay sesión activa.' }, 401);

  const payload = await request.json();
  const parsed = profileSchema.safeParse(payload);
  if (!parsed.success) return json({ error: 'Datos inválidos.' }, 422);

  const { email, currentPassword, newPassword } = parsed.data;

  const existing = await findAdminByEmailExcludingSelf(admin.id, email);
  if (existing) {
    return json({ error: 'El correo ya está en uso por otro usuario.' }, 409);
  }

  if (newPassword) {
    if (!currentPassword) {
      return json({ error: 'Se requiere la contraseña actual para cambiar la contraseña.' }, 422);
    }
    const row = await findAdminByEmail(admin.email);
    if (!row) return json({ error: 'Usuario no encontrado.' }, 404);
    const valid = await compare(currentPassword, row.passwordHash);
    if (!valid) return json({ error: 'La contraseña actual es incorrecta.' }, 401);
    const passwordHash = await hash(newPassword, 12);
    await updateAdminPassword(admin.id, passwordHash);
  }

  if (email && email.toLowerCase() !== admin.email) {
    await updateAdminEmail(admin.id, email);
  }

  return json({ success: true, email: email.toLowerCase() }, 200);
};

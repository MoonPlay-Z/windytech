import type { APIRoute } from 'astro';
import { createAdmin, listAdmins, updateAdmin, updateAdminPassword, writeAudit } from '../../../lib/db/queries';
import { hashPassword } from '../../../lib/auth';
import { json, readJson, requireAdmin, requireOwner } from '../../../lib/api';
import { sameOrigin } from '../../../lib/security';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  if (!requireOwner(admin)) return json({ error: 'Solo el propietario puede ver usuarios.' }, 403);
  return json({ users: await listAdmins() }, 200, { 'Cache-Control': 'no-store' });
};

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  if (!requireOwner(admin)) return json({ error: 'Solo el propietario puede gestionar usuarios.' }, 403);

  const body = await readJson<{
    email?: string;
    password?: string;
    role?: string;
    id?: number;
    isActive?: boolean;
  }>(request);

  const role = body?.role === 'OWNER' ? 'OWNER' : 'EDITOR';

  if (body?.id) {
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) return json({ error: 'Id inválido.' }, 400);
    if (id === admin.id && body.isActive === false) {
      return json({ error: 'No puedes desactivar tu propia cuenta.' }, 400);
    }
    await updateAdmin(id, { role: body.role, isActive: body.isActive });
    if (body.password) {
      if (body.password.length < 8) return json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, 422);
      await updateAdminPassword(id, await hashPassword(body.password));
    }
    await writeAudit(admin.id, 'UPDATE', 'admin_users', String(id), { role, isActive: body.isActive });
    return json({ ok: true });
  }

  const email = (body?.email ?? '').trim().toLowerCase();
  const password = body?.password ?? '';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'Correo inválido.' }, 422);
  if (password.length < 8) return json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, 422);

  const id = await createAdmin(email, await hashPassword(password), role, admin.id);
  if (!id) return json({ error: 'No se pudo crear el usuario.' }, 503);
  await writeAudit(admin.id, 'CREATE', 'admin_users', String(id), { email, role });
  return json({ ok: true, id });
};

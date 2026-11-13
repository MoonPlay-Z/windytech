import type { APIRoute } from 'astro';
import { z } from 'zod';
import {
  createAdmin,
  findAdminById,
  listAdmins,
  updateAdmin,
  updateAdminPassword,
  writeAudit,
} from '../../../lib/db/queries';
import { hashPassword } from '../../../lib/auth';
import { json, readJson, requireAdmin, requireOwner } from '../../../lib/api';
import { sameOrigin } from '../../../lib/security';

export const prerender = false;

const roleSchema = z.enum(['OWNER', 'EDITOR']);

const updateSchema = z.object({
  id: z.coerce.number().int().positive(),
  role: roleSchema.optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).max(72).optional(),
});

const createSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(72),
  role: roleSchema.default('EDITOR'),
});

/** ¿Quedaría el sistema sin ningún propietario activo? */
async function wouldRemoveLastOwner(
  target: { id: number; role: string; isActive: boolean },
  next: { role: string; isActive: boolean },
): Promise<boolean> {
  const keepsOwner = next.role === 'OWNER' && next.isActive;
  if (!(target.role === 'OWNER' && target.isActive) || keepsOwner) return false;
  const owners = (await listAdmins()).filter((user) => user.role === 'OWNER' && user.isActive);
  return owners.length <= 1;
}

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

  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return json({ error: 'Datos inválidos.' }, 400);

  if (body.id !== undefined && body.id !== null && body.id !== '') {
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return json(
        { error: 'Datos inválidos.', fields: { rol: ['Elige Propietario o Editor.'] } },
        422,
      );
    }

    const { id, role, isActive, password } = parsed.data;
    const target = await findAdminById(id);
    if (!target) return json({ error: 'El usuario no existe.' }, 404);

    if (id === admin.id && isActive === false) {
      return json({ error: 'No puedes desactivar tu propia cuenta.' }, 400);
    }

    const next = { role: role ?? target.role, isActive: isActive ?? target.isActive };
    if (await wouldRemoveLastOwner(target, next)) {
      return json(
        { error: 'Debe quedar al menos un propietario activo. Asigna el rol a otra cuenta antes.' },
        409,
      );
    }

    await updateAdmin(id, { role, isActive });
    if (password) await updateAdminPassword(id, await hashPassword(password));
    await writeAudit(admin.id, 'UPDATE', 'admin_users', String(id), {
      role: next.role,
      isActive: next.isActive,
    });
    return json({ ok: true });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: 'Datos inválidos.', fields: { correo: ['Revisa el correo y usa una contraseña de 8 caracteres o más.'] } },
      422,
    );
  }

  const email = parsed.data.email.toLowerCase();
  const id = await createAdmin(email, await hashPassword(parsed.data.password), parsed.data.role, admin.id);
  if (!id) return json({ error: 'No se pudo crear el usuario.' }, 503);
  await writeAudit(admin.id, 'CREATE', 'admin_users', String(id), { email, role: parsed.data.role });
  return json({ ok: true, id });
};

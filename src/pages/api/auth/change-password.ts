import type { APIRoute } from 'astro';
import {
  customerSessionFromRequest,
  changeCustomerPassword,
} from '../../../lib/customer-auth';
import { json } from '../../../lib/api';
import { sameOrigin } from '../../../lib/security';
import { customerChangePasswordSchema } from '../../../lib/validation';

export const prerender = false;

export const PUT: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  try {
    const user = await customerSessionFromRequest(request);
    if (!user) return json({ error: 'No hay sesión activa.' }, 401);

    const payload = await request.json();
    const parsed = customerChangePasswordSchema.safeParse(payload);
    if (!parsed.success) {
      return json({ error: 'Contraseñas inválidas.' }, 422);
    }

    await changeCustomerPassword(user.id, parsed.data.currentPassword, parsed.data.newPassword);
    return json({ success: true }, 200);
  } catch (err: unknown) {
    if (err instanceof Error && (err as { status?: number }).status === 401) {
      return json({ error: err.message }, 401);
    }
    console.error('[auth] error al cambiar contraseña:', err);
    return json({ error: 'No se pudo cambiar la contraseña.' }, 500);
  }
};

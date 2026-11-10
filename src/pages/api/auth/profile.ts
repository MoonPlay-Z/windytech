import type { APIRoute } from 'astro';
import {
  customerSessionFromRequest,
  updateCustomerProfile,
} from '../../../lib/customer-auth';
import { json } from '../../../lib/api';
import { sameOrigin } from '../../../lib/security';
import { customerProfileSchema } from '../../../lib/validation';

export const prerender = false;

export const PUT: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  try {
    const user = await customerSessionFromRequest(request);
    if (!user) return json({ error: 'No hay sesión activa.' }, 401);

    const payload = await request.json();
    const parsed = customerProfileSchema.safeParse(payload);
    if (!parsed.success) {
      return json({ error: 'Nombre y correo inválidos.' }, 422);
    }

    await updateCustomerProfile(user.id, parsed.data.name, parsed.data.email);
    return json({ success: true, user: { id: user.id, name: parsed.data.name, email: parsed.data.email } }, 200);
  } catch (err: unknown) {
    if (err instanceof Error && (err as { status?: number }).status === 409) {
      return json({ error: err.message }, 409);
    }
    console.error('[auth] error al actualizar perfil:', err);
    return json({ error: 'No se pudo actualizar el perfil.' }, 500);
  }
};

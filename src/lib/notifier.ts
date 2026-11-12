/**
 * Avisos al cliente.
 *
 * Hoy el canal es el propio panel (y opcionalmente el navegador del cliente
 * con la Notification API). La capa está preparada para que, si algún día
 * hay una clave de correo (Resend, Brevo...), el mismo evento salga también
 * por correo sin tocar el flujo.
 */

import { serverEnv } from './env';
import { createCustomerNotification, listCustomerNotifications } from './db/queries';

export type NotifyEvent = {
  customerId: number;
  trackingId?: number | null;
  /** Título corto: "Tu equipo está en camino". */
  title: string;
  /** Texto para el aviso. */
  body: string;
  /** Enlace al que lleva el aviso. */
  url: string;
  /** Estado del seguimiento, para redactar el mensaje de WhatsApp. */
  status?: string;
  /** Referencia del seguimiento, para el mensaje de WhatsApp. */
  reference?: string;
};

export type NotificationChannel = 'panel' | 'email';

export type NotifyResult = {
  panel: boolean;
  email: 'sent' | 'skipped' | 'failed';
};

/** Envía el aviso por el panel y, si hay clave de correo, también por email. */
export async function notifyCustomer(event: NotifyEvent): Promise<NotifyResult> {
  let panel = false;
  if (event.customerId > 0) {
    const id = await createCustomerNotification({
      customerId: event.customerId,
      trackingId: event.trackingId ?? null,
      title: event.title,
      body: event.body,
      url: event.url,
      channel: 'panel',
    });
    panel = id !== null;
  }

  const email = await sendEmail(event);
  return { panel, email };
}

/**
 * Envío por correo con Resend. Si no hay clave configurada, se omite: el
 * aviso ya está en el panel del cliente.
 */
async function sendEmail(event: NotifyEvent): Promise<'sent' | 'skipped' | 'failed'> {
  const apiKey = serverEnv.resendKey;
  const from = serverEnv.mailFrom;
  if (!apiKey || !from || event.customerId <= 0) return 'skipped';

  // El correo del cliente se resuelve en la base; si no hay, no se envía.
  const recipient = await recipientEmail(event.customerId);
  if (!recipient) return 'skipped';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject: event.title,
        html: `<p style="font-family:system-ui,sans-serif;color:#0f2538">${escapeHtml(event.body)}</p>
<p><a href="${event.url}">Ver el detalle</a></p>`,
      }),
    });
    return response.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}

async function recipientEmail(customerId: number): Promise<string | null> {
  const { getPool } = await import('./db');
  const client = getPool();
  if (!client) return null;
  const result = await client.query<{ email: string }>(
    'SELECT email FROM customer_accounts WHERE id = $1 LIMIT 1',
    [customerId],
  );
  return result.rows[0]?.email ?? null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Texto listo para compartir por WhatsApp. */
export function whatsappMessage(input: {
  title: string;
  status: string;
  reference?: string;
  url: string;
}): string {
  const partes = [`Hola Windytech, te avisamos del estado de «${input.title}»`];
  if (input.status) partes.push(`Estado: ${input.status}.`);
  if (input.reference) partes.push(`Referencia: ${input.reference}.`);
  partes.push(`Puedes ver el detalle aquí: ${input.url}`);
  return partes.join(' ');
}

export { listCustomerNotifications };

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createCustomerNotification, getPurchaseOrder, writeAudit } from '../../../../lib/db/queries';
import { json, readJson, requireAdmin } from '../../../../lib/api';
import { sameOrigin } from '../../../../lib/security';
import { buildPaymentInstructions, isAllowedPaypalUrl } from '../../../../lib/payment-instructions';

export const prerender = false;

const orderIdSchema = z.number().int().positive();
const paymentSchema = z.discriminatedUnion('method', [
  z.object({
    orderId: orderIdSchema,
    method: z.literal('binance'),
    binanceDetails: z.string().trim().min(3, 'Indica las instrucciones para Binance Pay.').max(1000),
  }),
  z.object({
    orderId: orderIdSchema,
    method: z.literal('paypal'),
    paypalUrl: z.string().trim().min(1, 'Indica un enlace de pago de PayPal.').max(2048),
  }),
]);

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const parsed = paymentSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return json(
      { error: parsed.error.issues[0]?.message ?? 'Datos de pago inválidos.' },
      422,
    );
  }

  if (parsed.data.method === 'paypal' && !isAllowedPaypalUrl(parsed.data.paypalUrl)) {
    return json(
      { error: 'Usa un enlace HTTPS válido de PayPal o PayPal.Me.' },
      422,
    );
  }

  const order = await getPurchaseOrder(parsed.data.orderId);
  if (!order) return json({ error: 'La orden no existe.' }, 404);
  if (!order.customerId) {
    return json({ error: 'Esta orden no está asociada a una cuenta de cliente.' }, 422);
  }

  const instructions =
    parsed.data.method === 'binance'
      ? parsed.data.binanceDetails
      : parsed.data.paypalUrl;
  const amount = `${(Math.max(0, order.totalCents) / 100).toFixed(2)} ${order.currency}`;
  const body = buildPaymentInstructions({
    customerName: order.customerName,
    orderNumber: order.number,
    amount,
    method: parsed.data.method,
    details: instructions,
  });

  let notificationId: number | null;
  try {
    notificationId = await createCustomerNotification({
      customerId: order.customerId,
      trackingId: null,
      title: `Instrucciones de pago para ${order.number}`,
      body,
      url: parsed.data.method === 'paypal' ? parsed.data.paypalUrl : '',
      channel: 'payment',
    });
  } catch (error) {
    console.error('[admin] no se pudieron enviar instrucciones de pago al panel:', error);
    return json({ error: 'No se pudieron enviar las instrucciones al panel.' }, 503);
  }

  if (!notificationId) return json({ error: 'No se pudieron enviar las instrucciones al panel.' }, 503);

  await writeAudit(admin.id, 'PAYMENT_INSTRUCTIONS', 'purchase_orders', String(order.id), {
    orderNumber: order.number,
    method: parsed.data.method,
    channel: 'panel',
    customerId: order.customerId,
  });

  return json({ ok: true, notificationId });
};

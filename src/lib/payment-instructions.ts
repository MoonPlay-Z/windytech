export type PaymentMethod = 'binance' | 'paypal';

export function normalizeWhatsappPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `58${digits.slice(1)}`;
  if (digits.length === 10) return `58${digits}`;
  return digits;
}

export function isAllowedPaypalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const isPaypalHost =
      host === 'paypal.com' ||
      host.endsWith('.paypal.com') ||
      host === 'paypal.me' ||
      host.endsWith('.paypal.me');
    return url.protocol === 'https:' && isPaypalHost && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function buildPaymentInstructions(input: {
  customerName: string;
  orderNumber: string;
  amount: string;
  method: PaymentMethod;
  details: string;
}): string {
  return [
    `Hola ${input.customerName},`,
    `el total de tu orden ${input.orderNumber} es ${input.amount}.`,
    `Método de pago: ${input.method === 'binance' ? 'Binance Pay' : 'PayPal'}.`,
    input.method === 'binance'
      ? `Datos para pagar: ${input.details}`
      : `Enlace para pagar: ${input.details}`,
  ].join('\n');
}

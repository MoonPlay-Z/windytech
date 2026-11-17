import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildPaymentInstructions,
  isAllowedPaypalUrl,
  normalizeWhatsappPhone,
} from './payment-instructions';

describe('instrucciones de pago', () => {
  it('solo permite enlaces HTTPS de PayPal', () => {
    assert.equal(isAllowedPaypalUrl('https://www.paypal.com/paypalme/windytech'), true);
    assert.equal(isAllowedPaypalUrl('https://paypal.me/windytech'), true);
    assert.equal(isAllowedPaypalUrl('http://paypal.me/windytech'), false);
    assert.equal(isAllowedPaypalUrl('https://paypal.com.example.org/pay'), false);
    assert.equal(isAllowedPaypalUrl('https://user:pass@paypal.com/pay'), false);
  });

  it('compone instrucciones con el importe y el método elegidos', () => {
    assert.equal(
      buildPaymentInstructions({
        customerName: 'María',
        orderNumber: 'WO-2026-0001',
        amount: '25.00 USD',
        method: 'binance',
        details: 'Pay ID 123456',
      }),
      'Hola María,\nel total de tu orden WO-2026-0001 es 25.00 USD.\nMétodo de pago: Binance Pay.\nDatos para pagar: Pay ID 123456',
    );
  });

  it('normaliza teléfonos locales de Venezuela sin alterar números internacionales', () => {
    assert.equal(normalizeWhatsappPhone('+58 412 123 4567'), '584121234567');
    assert.equal(normalizeWhatsappPhone('0412-123-4567'), '584121234567');
    assert.equal(normalizeWhatsappPhone('412 123 4567'), '584121234567');
    assert.equal(normalizeWhatsappPhone('+1 415 555 2671'), '14155552671');
  });
});

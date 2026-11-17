import {
  buildPaymentInstructions,
  isAllowedPaypalUrl,
  normalizeWhatsappPhone,
  type PaymentMethod,
} from '../lib/payment-instructions';

function initOrderPayment() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-payment-dialog]');
  const methodSelect = document.querySelector<HTMLSelectElement>('[data-payment-method]');
  const binanceField = document.querySelector<HTMLElement>('[data-binance-field]');
  const binanceDetails = document.querySelector<HTMLTextAreaElement>('[data-binance-details]');
  const paypalField = document.querySelector<HTMLElement>('[data-paypal-field]');
  const paypalUrl = document.querySelector<HTMLInputElement>('[data-paypal-url]');
  const summary = document.querySelector<HTMLElement>('[data-payment-summary]');
  const accountMessage = document.querySelector<HTMLElement>('[data-payment-account-message]');
  const phoneMessage = document.querySelector<HTMLElement>('[data-payment-phone-message]');
  const feedback = document.querySelector<HTMLElement>('[data-payment-feedback]');
  const whatsappButton = document.querySelector<HTMLButtonElement>('[data-payment-whatsapp]');
  const panelButton = document.querySelector<HTMLButtonElement>('[data-payment-panel]');
  if (
    !dialog ||
    !methodSelect ||
    !binanceField ||
    !binanceDetails ||
    !paypalField ||
    !paypalUrl ||
    !summary ||
    !accountMessage ||
    !phoneMessage ||
    !feedback ||
    !whatsappButton ||
    !panelButton
  ) {
    return;
  }

  if (dialog.dataset.wtBound === 'true') return;
  dialog.dataset.wtBound = 'true';
  let order: {
    id: number;
    number: string;
    customer: string;
    phone: string;
    total: string;
    currency: string;
    hasAccount: boolean;
  } | null = null;

  const setFeedback = (message: string, isError = false) => {
    feedback.textContent = message;
    feedback.hidden = !message;
    feedback.classList.toggle('is-error', isError);
    feedback.classList.toggle('is-success', Boolean(message) && !isError);
  };

  const syncMethodFields = () => {
    const isBinance = methodSelect.value === 'binance';
    binanceField.hidden = !isBinance;
    binanceDetails.disabled = !isBinance;
    binanceDetails.required = isBinance;
    paypalField.hidden = isBinance;
    paypalUrl.disabled = isBinance;
    paypalUrl.required = !isBinance;
    setFeedback('');
  };

  const paymentData = () => {
    if (!order) return null;
    const methodValue = methodSelect.value;
    if (methodValue !== 'binance' && methodValue !== 'paypal') {
      setFeedback('Selecciona un método de pago válido.', true);
      return null;
    }
    const method: PaymentMethod = methodValue;
    if (method === 'binance') {
      const details = binanceDetails.value.trim();
      if (details.length < 3) {
        setFeedback('Ingresa el ID, wallet o instrucciones de Binance Pay.', true);
        binanceDetails.focus();
        return null;
      }
      return { method, details };
    }

    let url: URL;
    try {
      url = new URL(paypalUrl.value.trim());
    } catch {
      setFeedback('Ingresa un enlace válido de PayPal.', true);
      paypalUrl.focus();
      return null;
    }
    if (!isAllowedPaypalUrl(url.toString())) {
      setFeedback('Usa un enlace HTTPS válido de PayPal o PayPal.Me.', true);
      paypalUrl.focus();
      return null;
    }
    return { method, url: url.toString() };
  };

  document.querySelectorAll<HTMLButtonElement>('[data-payment-order]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.orderId);
      if (!Number.isInteger(id) || id <= 0) return;
      order = {
        id,
        number: button.dataset.orderNumber ?? '',
        customer: button.dataset.orderCustomer ?? '',
        phone: button.dataset.orderPhone ?? '',
        total: button.dataset.orderTotal ?? '0.00',
        currency: button.dataset.orderCurrency ?? 'USD',
        hasAccount: button.dataset.orderHasAccount === 'true',
      };
      summary.textContent = `${order.number} · ${order.customer} · ${order.total} ${order.currency}`;
      accountMessage.hidden = order.hasAccount;
      const phone = normalizeWhatsappPhone(order.phone);
      phoneMessage.hidden = phone.length >= 8;
      panelButton.disabled = !order.hasAccount;
      panelButton.textContent = 'Enviar al panel';
      whatsappButton.disabled = phone.length < 8;
      methodSelect.value = 'binance';
      binanceDetails.value = '';
      paypalUrl.value = '';
      setFeedback('');
      syncMethodFields();
      dialog.showModal();
    });
  });

  methodSelect.addEventListener('change', syncMethodFields);

  whatsappButton.addEventListener('click', () => {
    if (!order) return;
    const payment = paymentData();
    if (!payment) return;
    const phone = normalizeWhatsappPhone(order.phone);
    if (phone.length < 8) {
      setFeedback('La orden no tiene un número de teléfono válido para WhatsApp.', true);
      return;
    }
    const amount = `${order.total} ${order.currency}`;
    const message = buildPaymentInstructions({
      customerName: order.customer,
      orderNumber: order.number,
      amount,
      method: payment.method,
      details: payment.method === 'binance' ? payment.details : payment.url,
    });
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer',
    );
    setFeedback('WhatsApp se abrió con el mensaje listo. Revísalo y envíalo al cliente.');
  });

  panelButton.addEventListener('click', async () => {
    if (!order?.hasAccount) return;
    const payment = paymentData();
    if (!payment) return;
    panelButton.disabled = true;
    setFeedback('Enviando al panel del cliente…');
    try {
      const response = await fetch('/api/admin/purchase-orders/payment', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          method: payment.method,
          ...(payment.method === 'binance'
            ? { binanceDetails: payment.details }
            : { paypalUrl: payment.url }),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'No se pudo enviar el método de pago.');
      panelButton.textContent = 'Enviado al panel';
      setFeedback('Las instrucciones de pago ya están en las novedades de la cuenta del cliente.');
    } catch (error) {
      panelButton.disabled = !order.hasAccount;
      setFeedback(
        error instanceof Error ? error.message : 'No se pudo enviar el método de pago.',
        true,
      );
    }
  });
}

function bootOrderPayment() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrderPayment, { once: true });
  } else {
    initOrderPayment();
  }
  document.addEventListener('astro:page-load', initOrderPayment);
}

bootOrderPayment();

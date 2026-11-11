/**
 * Carrito de compras en localStorage + cotización por WhatsApp.
 * No fija precios: los vuelve a pedir a la API antes de cotizar.
 */

type CartItem = {
  productId: number;
  variantId: number | null;
  slug: string;
  name: string;
  variantLabel: string;
  priceCents: number;
  quantity: number;
  image: string;
};

type ProductResponse = {
  product: {
    id: number;
    slug: string;
    name: string;
    availability: string;
    image: { url: string } | null;
    price: { usdCents: number; vesCents: number | null };
    variants: {
      id: number;
      label: string;
      availability: string;
      price: { usdCents: number; vesCents: number | null };
    }[];
  };
  rate: { rate: number } | null;
};

const STORAGE_KEY = 'wt_cart_v1';
const CURRENCY_KEY = 'wt_currency';

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.slug === 'string') : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  updateCounts();
  window.dispatchEvent(new CustomEvent('wt:cart-updated'));
}

function sameLine(item: CartItem, productId: number, variantId: number | null) {
  return item.productId === productId && item.variantId === variantId;
}

function addItem(item: CartItem) {
  const cart = readCart();
  const existing = cart.find((entry) => sameLine(entry, item.productId, item.variantId));
  if (existing) existing.quantity = Math.min(existing.quantity + item.quantity, 20);
  else cart.push(item);
  writeCart(cart);
}

function removeItem(productId: number, variantId: number | null) {
  writeCart(readCart().filter((entry) => !sameLine(entry, productId, variantId)));
}

function setQuantity(productId: number, variantId: number | null, quantity: number) {
  const cart = readCart();
  const entry = cart.find((item) => sameLine(item, productId, variantId));
  if (!entry) return;
  entry.quantity = Math.min(Math.max(1, quantity), 20);
  writeCart(cart);
}

function updateCounts() {
  const count = readCart().reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((node) => {
    node.textContent = String(count);
    node.hidden = count === 0;
  });
}

function currency(): 'USD' | 'VES' {
  const stored = localStorage.getItem(CURRENCY_KEY);
  if (stored === 'USD' || stored === 'VES') return stored;
  const root = document.querySelector<HTMLElement>('[data-currency-default]');
  return root?.dataset.currencyDefault === 'VES' ? 'VES' : 'USD';
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

function formatVes(cents: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function applyCurrency() {
  const mode = currency();
  document.querySelectorAll<HTMLElement>('[data-usd]').forEach((node) => {
    const usd = Number(node.dataset.usd ?? '0');
    const ves = Number(node.dataset.ves ?? '0');
    if (mode === 'VES' && ves > 0) node.textContent = formatVes(ves);
    else node.textContent = formatUsd(usd);
  });
  document.querySelectorAll<HTMLElement>('[data-currency-option]').forEach((node) => {
    node.setAttribute('aria-pressed', String(node.dataset.currencyOption === mode));
  });
  window.dispatchEvent(new CustomEvent('wt:currency-changed', { detail: mode }));
}

function cartRoot() {
  return document.querySelector<HTMLElement>('[data-cart-root]');
}

function renderCart() {
  const root = cartRoot();
  if (!root) return;

  const locale = root.dataset.locale === 'en' ? 'en' : 'es';
  const rate = Number(root.dataset.rate ?? '0');
  const mode = currency();
  const cart = readCart();
  const empty = root.querySelector<HTMLElement>('[data-cart-empty]');
  const table = root.querySelector<HTMLElement>('[data-cart-table]');
  const itemsNode = root.querySelector<HTMLElement>('[data-cart-items]');

  if (empty) empty.hidden = cart.length > 0;
  if (table) table.hidden = cart.length === 0;

  if (itemsNode) {
    itemsNode.innerHTML = '';
    for (const item of cart) {
      const row = document.createElement('div');
      row.className = 'cart-line';
      row.innerHTML = `
        <div class="cart-line-media">
          ${
            item.image
              ? `<img src="${item.image}" alt="" width="96" height="72" loading="lazy" />`
              : `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="2.5" y="3.5" width="14" height="12" rx="2"/><path d="M16.5 9.5h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"/><path d="M9 20h7"/></svg>`
          }
        </div>
        <div class="cart-line-body">
          <a class="cart-line-name" href="${locale === 'en' ? '/en/catalog/' : '/catalogo/'}${item.slug}/">${item.name}</a>
          ${item.variantLabel ? `<span class="cart-line-variant">${item.variantLabel}</span>` : ''}
          <span class="cart-line-price">${mode === 'VES' && rate > 0 ? formatVes(item.priceCents * rate) : formatUsd(item.priceCents)}</span>
        </div>
        <div class="cart-line-qty">
          <button type="button" data-qty-down aria-label="${locale === 'en' ? 'Decrease' : 'Quitar uno'}">−</button>
          <input type="number" min="1" max="20" value="${item.quantity}" aria-label="${locale === 'en' ? 'Quantity' : 'Cantidad'}" data-qty-input />
          <button type="button" data-qty-up aria-label="${locale === 'en' ? 'Add one' : 'Añadir uno'}">+</button>
        </div>
        <div class="cart-line-total">${mode === 'VES' && rate > 0 ? formatVes(item.priceCents * item.quantity * rate) : formatUsd(item.priceCents * item.quantity)}</div>
        <button type="button" class="cart-line-remove" data-remove aria-label="${locale === 'en' ? 'Remove' : 'Quitar'}">×</button>
      `;

      row.querySelector('[data-qty-down]')?.addEventListener('click', () => {
        setQuantity(item.productId, item.variantId, item.quantity - 1);
      });
      row.querySelector('[data-qty-up]')?.addEventListener('click', () => {
        setQuantity(item.productId, item.variantId, item.quantity + 1);
      });
      row.querySelector<HTMLInputElement>('[data-qty-input]')?.addEventListener('change', (event) => {
        const value = Number((event.target as HTMLInputElement).value);
        setQuantity(item.productId, item.variantId, Number.isFinite(value) ? value : 1);
      });
      row.querySelector('[data-remove]')?.addEventListener('click', () => {
        removeItem(item.productId, item.variantId);
      });
      itemsNode.appendChild(row);
    }
  }

  const subtotal = cart.reduce((total, item) => total + item.priceCents * item.quantity, 0);
  const subtotalNode = root.querySelector<HTMLElement>('[data-cart-subtotal]');
  const totalNode = root.querySelector<HTMLElement>('[data-cart-total]');
  if (subtotalNode) {
    subtotalNode.textContent = mode === 'VES' && rate > 0 ? formatVes(subtotal * rate) : formatUsd(subtotal);
  }
  if (totalNode) {
    totalNode.textContent = mode === 'VES' && rate > 0 ? formatVes(subtotal * rate) : formatUsd(subtotal);
  }
}

/** Refresca precios y disponibilidad desde la API y vuelve a pintar. */
async function refreshCart() {
  const cart = readCart();
  if (cart.length === 0) return;
  const locale = cartRoot()?.dataset.locale === 'en' ? 'en' : 'es';
  const slugs = [...new Set(cart.map((item) => item.slug))];

  const results = await Promise.allSettled(
    slugs.map(async (slug) => {
      const response = await fetch(`/api/products/${encodeURIComponent(slug)}?locale=${locale}`);
      if (!response.ok) return null;
      return (await response.json()) as ProductResponse;
    }),
  );

  let changed = false;
  const next = cart.map((item) => {
    const result = results.find((entry) => entry.status === 'fulfilled' && entry.value?.product.slug === item.slug);
    if (!result || result.status !== 'fulfilled' || !result.value) return item;
    const product = result.value.product;
    const variant = item.variantId ? product.variants.find((entry) => entry.id === item.variantId) : null;
    const availability = variant?.availability ?? product.availability;
    if (availability === 'OUT_OF_STOCK') return item;
    const priceCents = variant?.price?.usdCents ?? product.price.usdCents;
    const image = product.image?.url ?? item.image;
    if (priceCents !== item.priceCents || image !== item.image) {
      changed = true;
      return { ...item, priceCents, image, name: product.name };
    }
    return item;
  });

  if (changed) writeCart(next);
  else renderCart();
}

const boundButtons = new WeakSet<HTMLButtonElement>();

function setupAddButtons() {
  document.querySelectorAll<HTMLButtonElement>('[data-add-to-cart]').forEach((button) => {
    if (boundButtons.has(button)) return;
    boundButtons.add(button);

    button.addEventListener('click', () => {
      const dataset = button.dataset;
      const productId = Number(dataset.id);
      const variantId = dataset.variant ? Number(dataset.variant) : null;
      if (!Number.isInteger(productId) || productId <= 0) return;
      if (dataset.availability === 'OUT_OF_STOCK') return;

      addItem({
        productId,
        variantId,
        slug: dataset.slug ?? '',
        name: dataset.name ?? '',
        variantLabel: dataset.variantLabel ?? '',
        priceCents: Number(dataset.price ?? '0'),
        quantity: 1,
        image: dataset.image ?? '',
      });

      const original = button.textContent;
      button.textContent = button.dataset.addedLabel ?? '✓';
      button.classList.add('is-added');
      window.setTimeout(() => {
        button.textContent = original;
        button.classList.remove('is-added');
      }, 1600);
    });
  });
}

function setupCurrencySwitch() {
  document.querySelectorAll<HTMLButtonElement>('[data-currency-option]').forEach((button) => {
    if (boundButtons.has(button)) return;
    boundButtons.add(button);

    button.addEventListener('click', () => {
      const value = button.dataset.currencyOption;
      if (value !== 'USD' && value !== 'VES') return;
      localStorage.setItem(CURRENCY_KEY, value);
      applyCurrency();
      renderCart();
    });
  });
}

function setupQuoteForm() {
  const form = document.querySelector<HTMLFormElement>('[data-quote-form]');
  if (!form || form.dataset.wtBound === 'true') return;
  form.dataset.wtBound = 'true';
  const startedAt = Date.now();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const root = cartRoot();
    const locale = root?.dataset.locale === 'en' ? 'en' : 'es';
    const cart = readCart();
    const status = form.querySelector<HTMLElement>('[data-form-status]');
    const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
    const errorBox = form.querySelector<HTMLElement>('[data-form-error]');

    if (cart.length === 0) return;
    if (errorBox) errorBox.hidden = true;
    if (status) status.textContent = locale === 'en' ? 'Creating quote...' : 'Creando cotización...';
    if (submit) submit.disabled = true;

    const data = new FormData(form);
    const payload = {
      customerName: String(data.get('customerName') ?? ''),
      phone: String(data.get('phone') ?? ''),
      email: String(data.get('email') ?? ''),
      notes: String(data.get('notes') ?? ''),
      website: String(data.get('website') ?? ''),
      locale,
      currency: localStorage.getItem(CURRENCY_KEY) === 'VES' ? 'VES' : 'USD',
      elapsedMs: Date.now() - startedAt,
      items: cart.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        error?: string;
        path?: string;
        whatsappUrl?: string;
        number?: string;
      };

      if (!response.ok || !result.path) {
        throw new Error(result.error ?? 'Error');
      }

      const success = document.querySelector<HTMLElement>('[data-quote-success]');
      form.hidden = true;
      if (success) {
        success.hidden = false;
        const link = success.querySelector<HTMLAnchorElement>('[data-quote-link]');
        const whatsapp = success.querySelector<HTMLAnchorElement>('[data-quote-whatsapp]');
        const number = success.querySelector<HTMLElement>('[data-quote-number]');
        if (link) {
          link.href = result.path;
          link.textContent = result.path;
        }
        if (whatsapp) whatsapp.href = result.whatsappUrl ?? '#';
        if (number) number.textContent = result.number ?? '';
      }
      writeCart([]);
    } catch (error) {
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent = error instanceof Error ? error.message : 'Error';
      }
    } finally {
      if (status) status.textContent = '';
      if (submit) submit.disabled = false;
    }
  });
}

let globalsBound = false;

function setup() {
  updateCounts();
  applyCurrency();
  setupAddButtons();
  setupCurrencySwitch();
  setupQuoteForm();
  if (cartRoot()) {
    renderCart();
    void refreshCart();
  }

  if (globalsBound) return;
  globalsBound = true;

  window.addEventListener('wt:cart-updated', () => {
    renderCart();
    applyCurrency();
  });
  window.addEventListener('wt:currency-changed', renderCart);
  window.addEventListener('wt:prices-updated', applyCurrency);
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) renderCart();
  });
}

function initCart() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }
  document.addEventListener('astro:page-load', setup);
}

initCart();

/** Utilidades del panel: login, formularios JSON, borrado y subida a Cloudinary. */

type Json = Record<string, unknown>;

function setPath(target: Json, path: string, value: unknown) {
  const parts = path.split('.');
  let node = target;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const key = parts[index];
    if (typeof node[key] !== 'object' || node[key] === null) node[key] = {};
    node = node[key] as Json;
  }
  node[parts[parts.length - 1]] = value;
}

function fieldLabel(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
  const wrapper = element.closest('label');
  const span = wrapper?.querySelector('span');
  return span?.textContent?.trim() || element.name || 'campo';
}

function fieldValue(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  errors: string[],
): unknown {
  const type = element.dataset.type;
  if (element instanceof HTMLInputElement && element.type === 'checkbox') return element.checked;
  if (type === 'number') return element.value === '' ? null : Number(element.value);
  if (type === 'array') {
    return element.value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (type === 'lines') {
    return element.value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (type === 'json') {
    const raw = element.value.trim();
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      errors.push(`«${fieldLabel(element)}» no contiene un JSON válido.`);
      return {};
    }
  }
  return element.value;
}

function collect(form: HTMLFormElement): { payload: Json; errors: string[] } {
  const payload: Json = {};
  const errors: string[] = [];
  form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-field]').forEach((element) => {
    setPath(payload, element.dataset.field ?? '', fieldValue(element, errors));
  });

  // El panel es solo en español: los campos tr.es.* se agrupan en una única
  // traducción con locale 'es'.
  if (payload.tr && typeof payload.tr === 'object') {
    const groups = payload.tr as Record<string, Json>;
    const es = (groups.es ?? {}) as Json;
    payload.translations = [{ locale: 'es', ...es }];
    delete payload.tr;
  }

  return { payload, errors };
}

function message(form: HTMLFormElement, text: string, kind: 'ok' | 'error' = 'error') {
  const node = form.querySelector<HTMLElement>('[data-form-message]');
  if (!node) return;
  node.hidden = false;
  node.textContent = text;
  node.dataset.kind = kind;
}

async function submitJson(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    ok?: boolean;
    id?: number;
    fields?: Record<string, string[]>;
  };
  if (!response.ok) {
    const details = data.fields
      ? Object.entries(data.fields)
          .map(([field, list]) => `${field}: ${(list ?? []).join(' ')}`)
          .join(' · ')
      : '';
    const base = data.error ?? `Error (${response.status}).`;
    throw new Error(details ? `${base} (${details})` : base);
  }
  return data;
}

function setupLogin() {
  const form = document.querySelector<HTMLFormElement>('[data-login-form]');
  if (!form || form.dataset.wtBound === 'true') return;
  form.dataset.wtBound = 'true';
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    try {
      await submitJson('/api/admin/login', 'POST', {
        email: String(data.get('email') ?? ''),
        password: String(data.get('password') ?? ''),
      });
      window.location.href = '/admin/';
    } catch (error) {
      message(form, error instanceof Error ? error.message : 'Error');
    }
  });
}

function setupLogout() {
  document.querySelectorAll<HTMLButtonElement>('[data-logout]').forEach((button) => {
    if (button.dataset.wtBound === 'true') return;
    button.dataset.wtBound = 'true';

    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        const response = await fetch('/api/admin/logout', {
          method: 'POST',
          credentials: 'same-origin',
        });
        const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        if (!response.ok || !data.ok) {
          throw new Error(data.error ?? 'No se pudo cerrar la sesión.');
        }
        window.location.href = '/admin/login/';
      } catch (error) {
        const messageNode = document.querySelector<HTMLElement>('[data-session-message]');
        if (messageNode) {
          messageNode.hidden = false;
          messageNode.textContent = error instanceof Error ? error.message : 'Error al cerrar sesión.';
        }
        button.disabled = false;
      }
    });
  });
}

function setupForms() {
  document.querySelectorAll<HTMLFormElement>('[data-admin-form]').forEach((form) => {
    if (form.dataset.wtBound === 'true') return;
    form.dataset.wtBound = 'true';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const endpoint = form.dataset.endpoint ?? '';
      const redirect = form.dataset.redirect ?? '';
      const button = form.querySelector<HTMLButtonElement>('[type="submit"]');
      if (button) button.disabled = true;
      try {
        const { payload, errors } = collect(form);
        if (errors.length > 0) {
          message(form, errors[0]);
          return;
        }
        await submitJson(endpoint, 'POST', payload);
        message(form, form.dataset.success ?? 'Guardado.', 'ok');
        if (redirect) window.location.href = redirect;
        else window.location.reload();
      } catch (error) {
        message(form, error instanceof Error ? error.message : 'Error');
      } finally {
        if (button) button.disabled = false;
      }
    });
  });
}

let deleteDialog: HTMLDialogElement | null = null;
let dialogConfirmButton: HTMLButtonElement | null = null;
let dialogCancelButton: HTMLButtonElement | null = null;
let dialogError: HTMLElement | null = null;

function getDeleteDialog(): HTMLDialogElement {
  const existing = deleteDialog;
  if (existing && existing.isConnected && dialogConfirmButton) return existing;

  const dialog = document.createElement('dialog');
  dialog.className = 'admin-dialog';
  dialog.innerHTML = `
    <div class="admin-dialog-card">
      <h2 data-dialog-title></h2>
      <p data-dialog-message></p>
      <p class="admin-dialog-error" data-dialog-error hidden></p>
      <div class="admin-actions">
        <button type="button" class="admin-btn admin-btn--ghost" data-dialog-cancel>Cancelar</button>
        <button type="button" class="admin-btn admin-btn--danger" data-dialog-confirm>Eliminar</button>
      </div>
    </div>`;
  const titleNode = dialog.querySelector<HTMLElement>('[data-dialog-title]');
  const messageNode = dialog.querySelector<HTMLElement>('[data-dialog-message]');
  const errorNode = dialog.querySelector<HTMLElement>('[data-dialog-error]');
  const confirmButton = dialog.querySelector<HTMLButtonElement>('[data-dialog-confirm]');
  const cancelButton = dialog.querySelector<HTMLButtonElement>('[data-dialog-cancel]');
  if (!titleNode || !messageNode || !errorNode || !confirmButton || !cancelButton) {
    dialog.remove();
    return dialog;
  }
  deleteDialog = dialog;
  dialogConfirmButton = confirmButton;
  dialogCancelButton = cancelButton;
  dialogError = errorNode;

  cancelButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    cancelButton.click();
  });
  confirmButton.addEventListener('click', async () => {
    const endpoint = dialog.dataset.endpoint;
    if (!endpoint) {
      dialog.close();
      return;
    }
    confirmButton.disabled = true;
    try {
      await submitJson(endpoint, 'DELETE');
      dialog.close();
      window.location.reload();
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Error';
      if (dialogError) {
        dialogError.hidden = false;
        dialogError.textContent = text;
      }
      confirmButton.disabled = false;
    }
  });
  document.body.appendChild(dialog);
  return dialog;
}

function setupDelete() {
  document.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach((button) => {
    if (button.dataset.wtBound === 'true') return;
    button.dataset.wtBound = 'true';

    button.addEventListener('click', async () => {
      const dialog = getDeleteDialog();
      const confirmButton = dialog.querySelector<HTMLButtonElement>('[data-dialog-confirm]');
      const cancelButton = dialog.querySelector<HTMLButtonElement>('[data-dialog-cancel]');
      const errorNode = dialog.querySelector<HTMLElement>('[data-dialog-error]');
      const titleNode = dialog.querySelector<HTMLElement>('[data-dialog-title]');
      const messageNode = dialog.querySelector<HTMLElement>('[data-dialog-message]');
      if (!confirmButton || !cancelButton || !titleNode || !messageNode || !errorNode) return;
      dialog.dataset.endpoint = button.dataset.delete ?? '';
      dialog.dataset.message = button.dataset.confirm ?? '¿Eliminar este registro?';
      titleNode.textContent = button.dataset.deleteTitle ?? 'Eliminar registro';
      messageNode.textContent = dialog.dataset.message;
      if (errorNode) {
        errorNode.hidden = true;
        errorNode.textContent = '';
      }
      confirmButton.disabled = false;
      dialog.showModal();
    });
  });
}

type UploadItem = {
  cloudinaryPublicId: string;
  alt: string;
  isPrimary: boolean;
  position: number;
};

function setupUploaders() {
  document.querySelectorAll<HTMLElement>('[data-uploader]').forEach((root) => {
    if (root.dataset.wtBound === 'true') return;
    root.dataset.wtBound = 'true';

    const folder = root.dataset.folder ?? 'windytech/media';
    const mode = root.dataset.mode === 'single' ? 'single' : 'multi';
    const max = Number(root.dataset.max ?? (mode === 'single' ? 1 : 4));
    const hidden = root.querySelector<HTMLInputElement>('[data-upload-value]');
    const list = root.querySelector<HTMLElement>('[data-upload-list]');
    const fileInput = root.querySelector<HTMLInputElement>('[data-upload-input]');
    const altInput = root.querySelector<HTMLInputElement>('[data-upload-alt]');
    const filesLabel = root.querySelector<HTMLElement>('[data-upload-files]');
    if (!hidden || !list || !fileInput) return;

    // El input nativo muestra textos en inglés según el navegador: lo
    // escondemos y mostramos nuestro propio mensaje en español.
    const showFiles = (count: number) => {
      if (!filesLabel) return;
      filesLabel.textContent =
        count === 0
          ? 'Ningún archivo seleccionado'
          : count === 1
            ? '1 archivo seleccionado'
            : `${count} archivos seleccionados`;
    };
    fileInput.addEventListener('change', () => showFiles(fileInput.files?.length ?? 0));
    showFiles(fileInput.files?.length ?? 0);

    let items: UploadItem[] = [];
    if (mode === 'multi') {
      try {
        const parsed = JSON.parse(hidden.value || '[]');
        items = Array.isArray(parsed) ? parsed : [];
      } catch {
        items = [];
      }
    } else if (hidden.value.trim()) {
      // En modo single el valor inicial es el public_id ya guardado.
      items = [
        {
          cloudinaryPublicId: hidden.value.trim(),
          alt: '',
          isPrimary: true,
          position: 0,
        },
      ];
    }

    const sync = () => {
      if (mode === 'single') {
        hidden.value = items[0]?.cloudinaryPublicId ?? '';
      } else {
        hidden.value = JSON.stringify(items);
      }
      // Permite que otros formularios (por ejemplo la tarjeta social)
      // actualicen su vista previa cuando cambia la imagen.
      hidden.dispatchEvent(
        new CustomEvent('uploader:change', {
          bubbles: true,
          detail: {
            field: hidden.dataset.field ?? '',
            value: hidden.value,
            publicId: items[0]?.cloudinaryPublicId ?? '',
          },
        }),
      );
    };

    const render = () => {
      list.innerHTML = '';
      items.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'upload-item';
        row.innerHTML = `
          <img src="https://res.cloudinary.com/${root.dataset.cloud ?? ''}/image/upload/f_auto,q_auto,w_160/${item.cloudinaryPublicId}" alt="" />
          <div class="upload-item-fields">
            <input type="text" value="${(item.alt ?? '').replace(/"/g, '&quot;')}" data-alt placeholder="Texto alternativo" />
            ${
              mode === 'multi'
                ? `<label class="upload-primary"><input type="radio" name="primary-${folder}" ${item.isPrimary ? 'checked' : ''} data-primary /> Principal</label>`
                : ''
            }
            <button type="button" class="admin-btn admin-btn--danger" data-remove>Quitar</button>
          </div>
        `;
        row.querySelector<HTMLInputElement>('[data-alt]')?.addEventListener('input', (event) => {
          items[index].alt = (event.target as HTMLInputElement).value;
          sync();
        });
        row.querySelector<HTMLInputElement>('[data-primary]')?.addEventListener('change', () => {
          items = items.map((entry, position) => ({ ...entry, isPrimary: position === index }));
          sync();
          render();
        });
        row.querySelector('[data-remove]')?.addEventListener('click', () => {
          items.splice(index, 1);
          items = items.map((entry, position) => ({ ...entry, position }));
          if (!items.some((entry) => entry.isPrimary) && items[0]) items[0].isPrimary = true;
          sync();
          render();
        });
        list.appendChild(row);
      });
    };

    fileInput.addEventListener('change', async () => {
      const errorNode = root.querySelector<HTMLElement>('[data-upload-error]');
      const selected = [...(fileInput.files ?? [])];

      if (fileInput.disabled) {
        fileInput.value = '';
        return;
      }
      fileInput.disabled = true;

      try {
        if (items.length >= max) {
          if (errorNode) {
            errorNode.hidden = false;
            errorNode.textContent = `Ya tienes el máximo de ${max} imágenes. Quita alguna para añadir otra.`;
          }
          fileInput.value = '';
          return;
        }

        const room = max - items.length;
        const files = selected.slice(0, room);
        if (selected.length > room && errorNode) {
          errorNode.hidden = false;
          errorNode.textContent = `Solo caben ${room} imágenes más (máximo ${max}). Se descartaron ${selected.length - room}.`;
        }

        for (const file of files) {
          // El cupo se comprueba en cada archivo: si otra subida ya lo llenó,
          // se detiene aquí y no se supera el máximo.
          if (items.length >= max) {
            if (errorNode) {
              errorNode.hidden = false;
              errorNode.textContent = `Máximo ${max} imágenes por producto.`;
            }
            break;
          }
          try {
            const sign = await submitJson('/api/admin/uploads/sign', 'POST', { folder });
            const signature = sign as unknown as {
              timestamp: number;
              signature: string;
              apiKey: string;
              cloudName: string;
              folder: string;
            };
            const body = new FormData();
            body.append('file', file);
            body.append('api_key', signature.apiKey);
            body.append('timestamp', String(signature.timestamp));
            body.append('signature', signature.signature);
            body.append('folder', signature.folder);
            const response = await fetch(
              `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
              { method: 'POST', body },
            );
            const uploaded = (await response.json()) as { public_id?: string; secure_url?: string; error?: { message?: string } };
            if (!response.ok || !uploaded.public_id) {
              throw new Error(uploaded.error?.message ?? 'No se pudo subir la imagen.');
            }
            items.push({
              cloudinaryPublicId: uploaded.public_id,
              alt: altInput?.value?.trim() || 'Imagen de Windytech',
              isPrimary: items.length === 0,
              position: items.length,
            });
            if (mode === 'single') items = items.slice(-1);
            sync();
            render();
          } catch (error) {
            const node = root.querySelector<HTMLElement>('[data-upload-error]');
            if (node) {
              node.hidden = false;
              node.textContent = error instanceof Error ? error.message : 'Error al subir.';
            }
          }
        }
        fileInput.value = '';
      } finally {
        fileInput.disabled = false;
      }
    });

    render();
    sync();
  });
}

function setupQuoteStatus() {
  document.querySelectorAll<HTMLSelectElement>('[data-quote-status]').forEach((select) => {
    if (select.dataset.wtBound === 'true') return;
    select.dataset.wtBound = 'true';

    select.addEventListener('change', async () => {
      const id = Number(select.dataset.quoteStatus);
      const previous = select.dataset.previous ?? select.value;
      select.disabled = true;
      try {
        await submitJson('/api/admin/quotes', 'PATCH', {
          id,
          status: select.value,
        });
        select.dataset.previous = select.value;
        select.dataset.saved = 'true';
      } catch (error) {
        select.value = previous;
        window.alert(error instanceof Error ? error.message : 'Error');
      } finally {
        select.disabled = false;
      }
    });
  });
}

function setupEbayActions() {
  document.querySelectorAll<HTMLButtonElement>('[data-ebay-action]').forEach((button) => {
    if (button.dataset.wtEbayBound === 'true') return;
    button.dataset.wtEbayBound = 'true';
    button.addEventListener('click', async () => {
      const form = button.closest<HTMLFormElement>('[data-admin-form]');
      const productId = Number(button.dataset.ebayProductId ?? '0');
      const action = (button.dataset.ebayAction ?? 'create') as string;
      if (!form || !Number.isInteger(productId) || productId <= 0) return;
      try {
        const response = await fetch('/api/admin/ebay/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ productId, action }),
        });
        const data = (await response.json().catch(() => ({}))) as { itemId?: string; error?: string };
        if (response.ok) {
          message(form, data.itemId ? `Publicado en eBay. Item: ${data.itemId}` : 'Publicación guardada en eBay.', 'ok');
        } else {
          message(form, data.error ?? 'No se pudo publicar en eBay.', 'error');
        }
      } catch {
        message(form, 'Error al publicar en eBay.');
      }
    });
  });
}

type EbaySearchItem = {
  itemId: string;
  title: string;
  priceValueCents: number;
  currency: string;
  condition?: string | null;
  imageUrl?: string | null;
  itemWebUrl?: string | null;
};

function ebayMoney(cents: number, currency: string): string {
  return `${currency} ${(Math.max(0, cents) / 100).toFixed(2)}`;
}

function ebayConditionLabel(condition: string | null | undefined): string {
  if (!condition) return 'Sin condición';
  const value = condition.toLowerCase();
  if (value.includes('refurb')) return 'Reacondicionado';
  if (value.includes('used') || value.includes('pre-owned')) return 'Usado';
  if (value.includes('new')) return 'Nuevo';
  return condition;
}

function setEbayMessage(node: HTMLElement, text: string, kind: 'ok' | 'error') {
  node.hidden = false;
  node.textContent = text;
  node.dataset.kind = kind;
}

function ebayEditLink(productId: number, label: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.className = 'admin-btn admin-btn--ghost admin-btn--sm';
  link.href = `/admin/productos/${productId}/`;
  link.textContent = label;
  return link;
}

function ebayCard(item: EbaySearchItem, marginPercent: number): HTMLElement {
  const card = document.createElement('article');
  card.className = 'ebay-card';

  const media = document.createElement('div');
  media.className = 'ebay-card-media';
  if (item.imageUrl) {
    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.alt = '';
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    media.append(img);
  } else {
    media.textContent = 'Sin imagen';
  }

  const body = document.createElement('div');
  body.className = 'ebay-card-body';

  const title = document.createElement('strong');
  title.className = 'ebay-card-title';
  title.textContent = item.title;

  const meta = document.createElement('span');
  meta.className = 'admin-hint';
  meta.textContent = `${ebayConditionLabel(item.condition)} · ${item.itemId}`;

  const cost = document.createElement('span');
  cost.className = 'ebay-card-price';
  cost.textContent = `Costo: ${ebayMoney(item.priceValueCents, item.currency)}`;

  const estimate = Math.round(item.priceValueCents * (1 + marginPercent / 100));
  const resale = document.createElement('span');
  resale.className = 'ebay-card-price ebay-card-price--sale';
  resale.textContent = `Venta aprox.: ${ebayMoney(estimate, item.currency)} (sin envío)`;

  const actions = document.createElement('div');
  actions.className = 'admin-actions';

  const importButton = document.createElement('button');
  importButton.type = 'button';
  importButton.className = 'admin-btn admin-btn--sm';
  importButton.textContent = 'Importar';
  importButton.dataset.ebayImportId = item.itemId;

  actions.append(importButton);
  if (item.itemWebUrl) {
    const link = document.createElement('a');
    link.className = 'admin-btn admin-btn--ghost admin-btn--sm';
    link.href = item.itemWebUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Ver en eBay';
    actions.append(link);
  }

  body.append(title, meta, cost, resale, actions);
  card.append(media, body);
  return card;
}

function setupEbayImport() {
  const root = document.querySelector<HTMLElement>('[data-ebay-import]');
  if (!root || root.dataset.wtBound === 'true') return;
  root.dataset.wtBound = 'true';

  const queryInput = root.querySelector<HTMLInputElement>('[data-ebay-query]');
  const marginInput = root.querySelector<HTMLInputElement>('[data-ebay-margin]');
  const categorySelect = root.querySelector<HTMLSelectElement>('[data-ebay-category]');
  const activateInput = root.querySelector<HTMLInputElement>('[data-ebay-activate]');
  const searchButton = root.querySelector<HTMLButtonElement>('[data-ebay-search]');
  const messageNode = root.querySelector<HTMLElement>('[data-ebay-message]');
  const resultsNode = root.querySelector<HTMLElement>('[data-ebay-results]');
  if (!queryInput || !marginInput || !searchButton || !messageNode || !resultsNode) return;

  const itemCache = new Map<string, EbaySearchItem>();

  const runSearch = async () => {
    const query = queryInput.value.trim();
    if (query.length < 2) {
      setEbayMessage(messageNode, 'Escribe al menos 2 caracteres para buscar.', 'error');
      queryInput.focus();
      return;
    }

    searchButton.disabled = true;
    searchButton.textContent = 'Buscando…';
    resultsNode.replaceChildren();
    setEbayMessage(messageNode, 'Consultando eBay…', 'ok');

    try {
      const response = await fetch('/api/admin/ebay/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ query, limit: 12 }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        items?: EbaySearchItem[];
        error?: string;
      };
      if (!response.ok) throw new Error(data.error ?? 'No se pudo buscar en eBay.');

      const items = Array.isArray(data.items) ? data.items : [];
      if (items.length === 0) {
        setEbayMessage(messageNode, `Sin resultados para “${query}”. Prueba otras palabras.`, 'error');
        return;
      }

      const marginPercent = Math.max(0, Number(marginInput.value) || 0);
      itemCache.clear();
      for (const item of items) {
        itemCache.set(item.itemId, item);
        resultsNode.append(ebayCard(item, marginPercent));
      }
      setEbayMessage(messageNode, `${items.length} resultado(s). Elige uno y pulsa “Importar”.`, 'ok');
    } catch (error) {
      setEbayMessage(messageNode, error instanceof Error ? error.message : 'Error al buscar en eBay.', 'error');
    } finally {
      searchButton.disabled = false;
      searchButton.textContent = 'Buscar en eBay';
    }
  };

  searchButton.addEventListener('click', () => void runSearch());
  queryInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void runSearch();
    }
  });

  resultsNode.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>('[data-ebay-import-id]');
    if (!button || !resultsNode.contains(button) || button.disabled) return;

    const itemId = button.dataset.ebayImportId ?? '';
    if (!itemId) return;

    const marginPercent = Math.round(Math.max(0, Math.min(100, Number(marginInput.value) || 0)));
    const categoryId = categorySelect?.value ? Number(categorySelect.value) : null;
    const activate = activateInput ? activateInput.checked : true;
    const summary = itemCache.get(itemId);

    button.disabled = true;
    button.textContent = 'Importando…';
    setEbayMessage(
      messageNode,
      activate
        ? 'Importando imágenes y publicando el producto en el catálogo…'
        : 'Importando imágenes y creando el producto como borrador…',
      'ok',
    );

    try {
      const response = await fetch('/api/admin/ebay/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          itemId,
          marginPercent,
          categoryId,
          activate,
          fallback: summary
            ? {
                title: summary.title,
                priceValueCents: summary.priceValueCents,
                currency: summary.currency,
                condition: summary.condition ?? null,
                imageUrl: summary.imageUrl ?? null,
                itemWebUrl: summary.itemWebUrl ?? null,
              }
            : undefined,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        productId?: number;
        priceCents?: number;
        images?: number;
        isActive?: boolean;
        warnings?: string[];
        error?: string;
      };

      if (response.status === 409 && data.productId) {
        button.replaceWith(ebayEditLink(data.productId, 'Ya importado'));
        setEbayMessage(messageNode, data.error ?? 'Este producto ya estaba en tu catálogo.', 'error');
        return;
      }
      if (!response.ok) throw new Error(data.error ?? 'No se pudo importar el producto.');

      const warnings = (data.warnings ?? []).filter(Boolean);
      const published = data.isActive ?? activate;
      const parts = [
        `Producto #${data.productId} ${published ? 'publicado en el catálogo' : 'creado como borrador'}.`,
        data.priceCents != null ? `Precio de venta: USD ${(data.priceCents / 100).toFixed(2)}.` : '',
        data.images != null ? `Imágenes importadas: ${data.images}.` : '',
        ...warnings,
      ].filter(Boolean);
      setEbayMessage(messageNode, parts.join(' '), warnings.length > 0 ? 'error' : 'ok');
      if (data.productId) {
        button.replaceWith(
          ebayEditLink(data.productId, published ? 'Ver producto' : 'Editar borrador'),
        );
      }
    } catch (error) {
      button.disabled = false;
      button.textContent = 'Importar';
      setEbayMessage(messageNode, error instanceof Error ? error.message : 'Error al importar.', 'error');
    }
  });
}

function setupActiveNavScroll() {
  document.querySelector<HTMLElement>('.admin-nav-link.is-active')?.scrollIntoView({
    inline: 'center',
    block: 'nearest',
  });
}

function initAdmin() {
  setupLogin();
  setupLogout();
  setupForms();
  setupDelete();
  setupUploaders();
  setupQuoteStatus();
  setupEbayActions();
  setupEbayImport();
  setupActiveNavScroll();
}

function bootAdmin() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin, { once: true });
  } else {
    initAdmin();
  }
  document.addEventListener('astro:page-load', initAdmin);
}

bootAdmin();

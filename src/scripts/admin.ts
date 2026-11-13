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
    }

    const sync = () => {
      if (mode === 'single') {
        hidden.value = items[0]?.cloudinaryPublicId ?? '';
      } else {
        hidden.value = JSON.stringify(items);
      }
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

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

function fieldValue(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): unknown {
  const type = element.dataset.type;
  if (element instanceof HTMLInputElement && element.type === 'checkbox') return element.checked;
  if (type === 'number') return element.value === '' ? null : Number(element.value);
  if (type === 'array') {
    return element.value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (type === 'json') {
    try {
      return JSON.parse(element.value || '[]');
    } catch {
      return [];
    }
  }
  return element.value;
}

function collect(form: HTMLFormElement): Json {
  const payload: Json = {};
  form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-field]').forEach((element) => {
    setPath(payload, element.dataset.field ?? '', fieldValue(element));
  });

  // tr.es.name / tr.en.name → translations: [{ locale, ... }]
  if (payload.tr && typeof payload.tr === 'object') {
    const groups = payload.tr as Record<string, Json>;
    payload.translations = Object.entries(groups).map(([locale, fields]) => ({
      locale,
      ...fields,
    }));
    delete payload.tr;
  }

  return payload;
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
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as { error?: string; ok?: boolean; id?: number };
  if (!response.ok) throw new Error(data.error ?? 'Error');
  return data;
}

function setupLogin() {
  const form = document.querySelector<HTMLFormElement>('[data-login-form]');
  if (!form) return;
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
    button.addEventListener('click', async () => {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin/';
    });
  });
}

function setupForms() {
  document.querySelectorAll<HTMLFormElement>('[data-admin-form]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const endpoint = form.dataset.endpoint ?? '';
      const redirect = form.dataset.redirect ?? '';
      const button = form.querySelector<HTMLButtonElement>('[type="submit"]');
      if (button) button.disabled = true;
      try {
        await submitJson(endpoint, 'POST', collect(form));
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

function setupDelete() {
  document.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach((button) => {
    button.addEventListener('click', async () => {
      const endpoint = button.dataset.delete ?? '';
      const confirmText = button.dataset.confirm ?? '¿Eliminar este registro?';
      if (!window.confirm(confirmText)) return;
      try {
        await submitJson(endpoint, 'DELETE');
        window.location.reload();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Error');
      }
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
    const folder = root.dataset.folder ?? 'windytech/media';
    const mode = root.dataset.mode === 'single' ? 'single' : 'multi';
    const hidden = root.querySelector<HTMLInputElement>('[data-upload-value]');
    const list = root.querySelector<HTMLElement>('[data-upload-list]');
    const fileInput = root.querySelector<HTMLInputElement>('[data-upload-input]');
    const altInput = root.querySelector<HTMLInputElement>('[data-upload-alt]');
    if (!hidden || !list || !fileInput) return;

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
            <input type="text" value="${item.alt.replace(/"/g, '&quot;')}" data-alt placeholder="Texto alternativo" />
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
      const files = [...(fileInput.files ?? [])].slice(0, mode === 'single' ? 1 : 10);
      for (const file of files) {
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
          root.querySelector<HTMLElement>('[data-upload-error]')?.setAttribute('hidden', '');
        } catch (error) {
          const errorNode = root.querySelector<HTMLElement>('[data-upload-error]');
          if (errorNode) {
            errorNode.hidden = false;
            errorNode.textContent = error instanceof Error ? error.message : 'Error al subir.';
          }
        }
      }
      fileInput.value = '';
    });

    render();
    sync();
  });
}

function setupQuoteStatus() {
  document.querySelectorAll<HTMLSelectElement>('[data-quote-status]').forEach((select) => {
    select.addEventListener('change', async () => {
      try {
        await submitJson('/api/admin/quotes', 'PATCH', {
          id: Number(select.dataset.quoteStatus),
          status: select.value,
        });
        select.dataset.saved = 'true';
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Error');
      }
    });
  });
}

function setup() {
  setupLogin();
  setupLogout();
  setupForms();
  setupDelete();
  setupUploaders();
  setupQuoteStatus();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
else setup();

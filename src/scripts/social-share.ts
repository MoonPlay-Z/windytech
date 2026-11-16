/** Editor de tarjetas para redes sociales: vista previa en canvas y guardado. */

type ShareFormat = 'landscape' | 'square';

type ShareConfig = {
  enabled: boolean;
  companyName: string;
  message: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  format: ShareFormat;
  logoSize: number;
  logoPublicId: string | null;
  backgroundPublicId: string | null;
  imagePublicId: string | null;
  imageWidth: number;
  imageHeight: number;
};

const SIZES: Record<ShareFormat, { width: number; height: number }> = {
  landscape: { width: 1200, height: 630 },
  square: { width: 1080, height: 1080 },
};

function isLight(hex: string): boolean {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) return false;
  const [r, g, b] = match.slice(1).map((value) => parseInt(value, 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.62;
}

function downloadCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
): void {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let current = '';
  let index = 0;

  while (index < words.length) {
    const candidate = current ? `${current} ${words[index]}` : words[index];
    if (!current || context.measureText(candidate).width <= maxWidth) {
      current = candidate;
      index += 1;
      continue;
    }
    lines.push(current);
    current = '';
    if (lines.length >= maxLines) break;
  }

  if (lines.length < maxLines && current) lines.push(current);

  if (index < words.length && lines.length >= maxLines) {
    let last = lines[maxLines - 1];
    while (last.length > 1 && context.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = `${last.trimEnd()}…`;
  }

  return lines;
}

function setFittedFont(
  context: CanvasRenderingContext2D,
  text: string,
  weight: number,
  size: number,
  family: string,
  maxWidth: number,
): number {
  let current = size;
  context.font = `${weight} ${current}px ${family}`;
  while (current > 12 && context.measureText(text).width > maxWidth) {
    current -= 1;
    context.font = `${weight} ${current}px ${family}`;
  }
  return current;
}

function initEditor(root: HTMLElement): void {
  if (root.dataset.wtBound === 'true') return;
  root.dataset.wtBound = 'true';

  const canvas = root.querySelector<HTMLCanvasElement>('[data-share-canvas]');
  const form = root.querySelector<HTMLFormElement>('[data-share-form]');
  if (!canvas || !form) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  const cloud =
    root.querySelector<HTMLElement>('[data-uploader]')?.dataset.cloud ?? 'cxy5wtgr';
  const status = root.querySelector<HTMLElement>('[data-share-message]');
  const sizeLabel = root.querySelector<HTMLElement>('[data-share-size]');
  const saveButton = root.querySelector<HTMLButtonElement>('[data-share-save]');
  const deleteButton = root.querySelector<HTMLButtonElement>('[data-share-delete]');
  const autoText = root.querySelector<HTMLInputElement>('[data-share-auto-text]');
  const manualText = field<HTMLInputElement>('textColor');

  const imageCache = new Map<string, Promise<HTMLImageElement | null>>();
  let drawToken = 0;
  let scheduled = 0;
  let saving = false;

  function field<T extends HTMLElement>(name: string): T | null {
    return root.querySelector<T>(`[data-share-field="${name}"]`);
  }

  function uploadField(name: string): HTMLInputElement | null {
    return root.querySelector<HTMLInputElement>(`input[data-field="${name}"]`);
  }

  function loadImage(publicId: string): Promise<HTMLImageElement | null> {
    const cached = imageCache.get(publicId);
    if (cached) return cached;
    const promise = new Promise<HTMLImageElement | null>((resolve) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = `https://res.cloudinary.com/${cloud}/image/upload/${publicId}`;
    });
    imageCache.set(publicId, promise);
    return promise;
  }

  function readConfig(): ShareConfig {
    const formatValue = field<HTMLSelectElement>('format')?.value;
    const format: ShareFormat = formatValue === 'square' ? 'square' : 'landscape';
    return {
      enabled: Boolean(field<HTMLInputElement>('enabled')?.checked),
      companyName: field<HTMLInputElement>('companyName')?.value.trim() ?? '',
      message: field<HTMLTextAreaElement>('message')?.value.trim() ?? '',
      subtitle: field<HTMLTextAreaElement>('subtitle')?.value.trim() ?? '',
      backgroundColor:
        field<HTMLInputElement>('backgroundColor')?.value.toLowerCase() || '#0e2234',
      textColor: autoText?.checked
        ? ''
        : field<HTMLInputElement>('textColor')?.value.toLowerCase() || '',
      format,
      logoSize: Number(field<HTMLInputElement>('logoSize')?.value) || 22,
      logoPublicId: uploadField('logoPublicId')?.value.trim() || null,
      backgroundPublicId: uploadField('backgroundPublicId')?.value.trim() || null,
      imagePublicId: field<HTMLInputElement>('imagePublicId')?.value.trim() || null,
      imageWidth: canvas?.width ?? SIZES[format].width,
      imageHeight: canvas?.height ?? SIZES[format].height,
    };
  }

  async function draw(): Promise<void> {
    const config = readConfig();
    const dimensions = SIZES[config.format];

    if (canvas!.width !== dimensions.width || canvas!.height !== dimensions.height) {
      canvas!.width = dimensions.width;
      canvas!.height = dimensions.height;
      if (sizeLabel) {
        sizeLabel.textContent = `${dimensions.width} × ${dimensions.height} px · se guarda como JPEG de calidad 0,9`;
      }
    }

    const token = ++drawToken;
    const [background, logo] = await Promise.all([
      config.backgroundPublicId ? loadImage(config.backgroundPublicId) : Promise.resolve(null),
      config.logoPublicId ? loadImage(config.logoPublicId) : Promise.resolve(null),
    ]);
    if (token !== drawToken) return;

    const width = canvas!.width;
    const height = canvas!.height;
    const ctx = context!;
    const padding = Math.round(width * 0.07);
    const contentWidth = width - padding * 2;
    const textColor =
      config.textColor || (isLight(config.backgroundColor) ? '#0e2234' : '#ffffff');

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    if (background) {
      downloadCover(ctx, background, width, height);
      // Velo del color elegido para que el texto siempre se lea.
      ctx.globalAlpha = 0.74;
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
    }

    const companySize = Math.max(15, Math.round(height * 0.028));
    const messageSize = Math.round(height * (config.format === 'square' ? 0.072 : 0.082));
    const subtitleSize = Math.round(height * (config.format === 'square' ? 0.034 : 0.04));
    const logoHeight = (height * config.logoSize) / 100;

    if (logo && logo.width > 0 && logo.height > 0) {
      const ratio = Math.min((width * 0.4) / logo.width, logoHeight / logo.height);
      const logoWidth = logo.width * ratio;
      const currentLogoHeight = logo.height * ratio;
      ctx.drawImage(logo, padding, padding, logoWidth, currentLogoHeight);
    }

    const company = config.companyName.toUpperCase();
    if (company) {
      setFittedFont(ctx, company, 700, companySize, 'Outfit, sans-serif', contentWidth * 0.58);
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.86;
      ctx.textAlign = logo ? 'right' : 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(company, logo ? width - padding : padding, padding + Math.round(height * 0.012));
      ctx.globalAlpha = 1;
    }

    const familyDisplay = 'Outfit, sans-serif';
    const familyBody = '"DM Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.font = `700 ${messageSize}px ${familyDisplay}`;
    const messageLines = wrapText(ctx, config.message, contentWidth, config.format === 'square' ? 4 : 3);
    ctx.font = `400 ${subtitleSize}px ${familyBody}`;
    const subtitleLines = wrapText(
      ctx,
      config.subtitle,
      contentWidth,
      config.format === 'square' ? 4 : 3,
    );

    const messageLineHeight = Math.round(messageSize * 1.1);
    const subtitleLineHeight = Math.round(subtitleSize * 1.28);
    const accentHeight = Math.max(3, Math.round(height * 0.006));
    const accentGap = Math.round(height * 0.03);
    const blockGap = Math.round(height * 0.022);

    let blockHeight = 0;
    if (messageLines.length > 0 || subtitleLines.length > 0) {
      blockHeight += accentHeight + accentGap;
    }
    if (messageLines.length > 0) {
      blockHeight += messageLines.length * messageLineHeight;
    }
    if (subtitleLines.length > 0) {
      blockHeight += (messageLines.length > 0 ? blockGap : 0) + subtitleLines.length * subtitleLineHeight;
    }

    let y = height - padding - blockHeight;
    const minY = padding + (logo ? logoHeight + height * 0.08 : height * 0.2);
    y = Math.max(y, minY);

    if (messageLines.length > 0 || subtitleLines.length > 0) {
      ctx.fillStyle = '#5eead4';
      ctx.fillRect(padding, y, Math.round(width * 0.09), accentHeight);
      y += accentHeight + accentGap;
    }

    if (messageLines.length > 0) {
      ctx.fillStyle = textColor;
      ctx.font = `700 ${messageSize}px ${familyDisplay}`;
      for (const line of messageLines) {
        ctx.fillText(line, padding, y);
        y += messageLineHeight;
      }
    }

    if (subtitleLines.length > 0) {
      y += messageLines.length > 0 ? blockGap : 0;
      ctx.globalAlpha = 0.86;
      ctx.fillStyle = textColor;
      ctx.font = `400 ${subtitleSize}px ${familyBody}`;
      for (const line of subtitleLines) {
        ctx.fillText(line, padding, y);
        y += subtitleLineHeight;
      }
      ctx.globalAlpha = 1;
    }
  }

  function schedule(): void {
    if (scheduled) cancelAnimationFrame(scheduled);
    scheduled = requestAnimationFrame(() => {
      scheduled = 0;
      draw().catch(() => {
        /* una imagen que no carga no debe bloquear el editor */
      });
    });
  }

  function showStatus(message: string, kind: 'ok' | 'error'): void {
    if (!status) return;
    status.hidden = false;
    status.dataset.kind = kind;
    status.textContent = message;
  }

  function hideStatus(): void {
    if (!status) return;
    status.hidden = true;
    status.textContent = '';
  }

  function setBusy(busy: boolean): void {
    if (saveButton) {
      saveButton.disabled = busy;
      saveButton.textContent = busy ? 'Guardando…' : 'Guardar tarjeta';
    }
    if (deleteButton) deleteButton.disabled = busy;
  }

  async function postJson(
    url: string,
    body: unknown,
    method = 'POST',
  ): Promise<Record<string, unknown>> {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
      const fields = data.fields as Record<string, string[]> | undefined;
      const first = fields ? Object.values(fields).flat()[0] : '';
      throw new Error(first || String(data.error || 'No se pudo guardar la tarjeta.'));
    }
    return data;
  }

  async function save(): Promise<void> {
    if (saving) return;
    saving = true;
    setBusy(true);
    hideStatus();

    try {
      await draw();
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas!.toBlob(resolve, 'image/jpeg', 0.9);
      });
      if (!blob) throw new Error('No se pudo generar la imagen de la tarjeta.');

      const signature = (await postJson('/api/admin/uploads/sign', {
        folder: 'windytech/redes',
      })) as unknown as {
        timestamp: number;
        signature: string;
        apiKey: string;
        cloudName: string;
        folder: string;
      };

      const upload = new FormData();
      upload.append('file', blob, 'tarjeta-redes.jpg');
      upload.append('api_key', signature.apiKey);
      upload.append('timestamp', String(signature.timestamp));
      upload.append('signature', signature.signature);
      upload.append('folder', signature.folder);

      const uploadedResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
        { method: 'POST', body: upload },
      );
      const uploaded = (await uploadedResponse.json()) as {
        public_id?: string;
        error?: { message?: string };
      };
      if (!uploadedResponse.ok || !uploaded.public_id) {
        throw new Error(uploaded.error?.message ?? 'No se pudo subir la tarjeta.');
      }

      const config = readConfig();
      config.imagePublicId = uploaded.public_id;
      config.imageWidth = canvas!.width;
      config.imageHeight = canvas!.height;

      await postJson('/api/admin/social-share', {
        entityType: root.dataset.entityType,
        entityId: root.dataset.entityId ?? '',
        config,
      });

      const hiddenImage = field<HTMLInputElement>('imagePublicId');
      if (hiddenImage) hiddenImage.value = uploaded.public_id;
      root.dataset.hasOverride = 'true';
      if (deleteButton) deleteButton.hidden = false;

      showStatus('Tarjeta guardada. Ya se usa al compartir esta página.', 'ok');
    } catch (error) {
      showStatus(
        error instanceof Error ? error.message : 'No se pudo guardar la tarjeta.',
        'error',
      );
    } finally {
      saving = false;
      setBusy(false);
    }
  }

  async function remove(): Promise<void> {
    if (!deleteButton) return;
    const question = deleteButton.dataset.confirm || '¿Quitar esta personalización?';
    if (!window.confirm(question)) return;

    setBusy(true);
    hideStatus();
    try {
      const params = new URLSearchParams({
        entityType: root.dataset.entityType ?? 'global',
        entityId: root.dataset.entityId ?? '',
      });
      const response = await fetch(`/api/admin/social-share?${params.toString()}`, {
        method: 'DELETE',
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || 'No se pudo quitar la tarjeta.');
      window.location.reload();
    } catch (error) {
      showStatus(
        error instanceof Error ? error.message : 'No se pudo quitar la tarjeta.',
        'error',
      );
      setBusy(false);
    }
  }

  if (autoText) {
    if (manualText) manualText.disabled = autoText.checked;
    autoText.addEventListener('change', () => {
      if (manualText) manualText.disabled = autoText.checked;
      schedule();
    });
  }

  form.addEventListener('input', schedule);
  form.addEventListener('change', schedule);
  form.addEventListener('uploader:change', schedule);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void save();
  });
  deleteButton?.addEventListener('click', () => {
    void remove();
  });

  draw().catch(() => {
    /* el editor mantiene la tarjeta anterior si una imagen falla */
  });
  document.fonts?.ready.then(schedule).catch(() => {});
}

function setupFilters(): void {
  document.querySelectorAll<HTMLInputElement>('[data-share-filter]').forEach((input) => {
    if (input.dataset.wtBound === 'true') return;
    input.dataset.wtBound = 'true';

    const target = document.querySelector<HTMLElement>(input.dataset.shareFilter || '');
    if (!target) return;
    const rows = [...target.querySelectorAll<HTMLElement>('tr[data-search]')];

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      for (const row of rows) {
        row.hidden = Boolean(query) && !(row.dataset.search ?? '').includes(query);
      }
    });
  });
}

function boot(): void {
  document.querySelectorAll<HTMLElement>('[data-social-share]').forEach(initEditor);
  setupFilters();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
document.addEventListener('astro:page-load', boot);

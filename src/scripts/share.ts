/**
 * Botón de "copiar enlace" del módulo de difusión.
 * Se reinicia en cada navegación del ClientRouter, sin duplicar listeners.
 */

function initShareCopy() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy-share]').forEach((button) => {
    if (button.dataset.wtBound === 'true') return;
    button.dataset.wtBound = 'true';

    button.addEventListener('click', async () => {
      const label = button.querySelector('span');
      const status = button.closest('[data-share-group]')?.querySelector<HTMLElement>(
        '[data-share-status]',
      );

      const url = button.dataset.copyUrl ?? window.location.href;

      try {
        await navigator.clipboard.writeText(url);
        if (label) label.textContent = button.dataset.copiedLabel ?? label.textContent;
        if (status) status.textContent = button.dataset.copiedLabel ?? '';
        button.dataset.copyState = 'copied';
      } catch {
        const errorMessage = button.dataset.errorLabel ?? '';
        if (label) label.textContent = errorMessage;
        if (status) status.textContent = errorMessage;
        button.dataset.copyState = 'error';
      }

      window.setTimeout(() => {
        if (label) label.textContent = button.dataset.copyLabel ?? '';
        if (status) status.textContent = '';
        button.dataset.copyState = '';
      }, 3000);
    });
  });
}

function bootShare() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShareCopy, { once: true });
  } else {
    initShareCopy();
  }
  document.addEventListener('astro:page-load', initShareCopy);
}

bootShare();

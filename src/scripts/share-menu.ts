/**
 * Menú de compartir: botón que despliega las opciones para redes sociales.
 * Accesible (aria-expanded, Escape, clic fuera) y con copia del enlace.
 */

function closeMenu(menu: HTMLElement) {
  const trigger = menu.querySelector<HTMLButtonElement>('[data-share-trigger]');
  const panel = menu.querySelector<HTMLElement>('[data-share-panel]');
  trigger?.setAttribute('aria-expanded', 'false');
  if (panel) panel.hidden = true;
  menu.classList.remove('is-open');
}

function initShareMenus() {
  document.querySelectorAll<HTMLElement>('[data-share-menu]').forEach((menu) => {
    if (menu.dataset.wtBound === 'true') return;
    menu.dataset.wtBound = 'true';

    const trigger = menu.querySelector<HTMLButtonElement>('[data-share-trigger]');
    const panel = menu.querySelector<HTMLElement>('[data-share-panel]');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const abierto = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!abierto));
      panel.hidden = abierto;
      menu.classList.toggle('is-open', !abierto);
    });

    // Cerrar al pulsar fuera o con Escape.
    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target as Node)) closeMenu(menu);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu(menu);
    });

    // Copiar enlace.
    const copyButton = panel.querySelector<HTMLButtonElement>('[data-copy-share]');
    if (copyButton) {
      copyButton.addEventListener('click', async () => {
        const label = copyButton.querySelector('span');
        const url = copyButton.dataset.copyUrl ?? window.location.href;
        try {
          await navigator.clipboard.writeText(url);
          if (label) label.textContent = copyButton.dataset.copiedLabel ?? 'Enlace copiado';
        } catch {
          if (label) label.textContent = copyButton.dataset.errorLabel ?? 'No se pudo copiar';
        }
        window.setTimeout(() => {
          if (label) label.textContent = copyButton.dataset.copyLabel ?? 'Copiar enlace';
        }, 2500);
      });
    }
  });
}

function bootShareMenu() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShareMenus, { once: true });
  } else {
    initShareMenus();
  }
  document.addEventListener('astro:page-load', initShareMenus);
}

bootShareMenu();

/**
 * Menú de compartir: botón que despliega las opciones para redes sociales.
 * Accesible (aria-expanded, Escape, clic fuera) y con copia del enlace.
 */

function closeMenu(menu: HTMLElement) {
  const trigger = menu.querySelector<HTMLButtonElement>('[data-share-trigger]');
  const panel = menu.querySelector<HTMLElement>('[data-share-panel]');
  trigger?.setAttribute('aria-expanded', 'false');
  if (panel) panel.hidden = true;
  menu.classList.remove('is-open', 'is-up');
  // La tarjeta que contiene el menú deja de estar por encima de las demás.
  menu.closest('.plan-card, .product-card')?.classList.remove('has-open-share');
}

/** Abre el menú hacia arriba si no cabe debajo del botón. */
function direction(menu: HTMLElement, panel: HTMLElement) {
  const box = panel.getBoundingClientRect();
  const espacioAbajo = window.innerHeight - box.top;
  menu.classList.toggle('is-up', espacioAbajo < box.height + 24);
}

function initShareMenus() {
  document.querySelectorAll<HTMLElement>('[data-share-menu]').forEach((menuEl) => {
    if (menuEl.dataset.wtBound === 'true') return;
    menuEl.dataset.wtBound = 'true';

    const trigger = menuEl.querySelector<HTMLButtonElement>('[data-share-trigger]');
    const panel = menuEl.querySelector<HTMLElement>('[data-share-panel]');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const abierto = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!abierto));
      panel.hidden = abierto;
      menuEl.classList.toggle('is-open', !abierto);

      if (!abierto) {
        // La tarjeta se coloca por encima para que el menú no se corte.
        menuEl.closest('.plan-card, .product-card')?.classList.add('has-open-share');
        direction(menuEl, panel);
      } else {
        menuEl.closest('.plan-card, .product-card')?.classList.remove('has-open-share');
      }
    });

    // Cerrar al pulsar fuera o con Escape.
    document.addEventListener('click', (event) => {
      if (!menuEl.contains(event.target as Node)) closeMenu(menuEl);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu(menuEl);
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

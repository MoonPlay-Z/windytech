/**
 * Menú contextual de las filas del panel: el botón de la derecha abre un
 * menú con las acciones de ese registro, en lugar de repetir botones en
 * cada fila.
 *
 * El menú se escribe en el HTML (para poder usar los iconos del registro
 * central) y el script solo se encarga de colocarlo y cerrarlo.
 *
 *   <button data-context-menu="menu-producto-1">…</button>
 *   <div class="win-menu win-context-menu" id="menu-producto-1" hidden>…</div>
 */

function initContextMenus() {
  document.querySelectorAll<HTMLElement>('[data-context-menu]').forEach((boton) => {
    if (boton.dataset.wtBound === 'true') return;
    boton.dataset.wtBound = 'true';

    const menu = document.getElementById(boton.dataset.contextMenu ?? '');
    if (!menu) return;

    const cerrar = () => {
      menu.hidden = true;
      boton.setAttribute('aria-expanded', 'false');
    };

    boton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!menu.hidden) {
        cerrar();
        return;
      }

      menu.hidden = false;
      boton.setAttribute('aria-expanded', 'true');

      // Se coloca junto al botón, dentro de la ventana.
      const caja = boton.getBoundingClientRect();
      const anchoMenu = menu.offsetWidth;
      const altoMenu = menu.offsetHeight;

      const izquierda = Math.max(
        8,
        Math.min(caja.right - anchoMenu, window.innerWidth - anchoMenu - 8),
      );
      const arriba =
        caja.bottom + altoMenu + 8 > window.innerHeight
          ? Math.max(8, caja.top - altoMenu - 4)
          : caja.bottom + 4;

      menu.style.left = `${izquierda}px`;
      menu.style.top = `${arriba}px`;

      // El siguiente clic fuera lo cierra.
      window.setTimeout(() => {
        document.addEventListener('click', cerrar, { once: true });
      }, 0);
    });

    // Escape también lo cierra.
    menu.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') cerrar();
    });

    // Las acciones de peligro reutilizan el borrado que ya existe.
    menu.querySelectorAll<HTMLAnchorElement>('a[data-peligro="true"]').forEach((enlace) => {
      enlace.addEventListener('click', (event) => {
        const destino = enlace.dataset.delete;
        if (!destino) return;
        event.preventDefault();
        cerrar();
        const disparador = document.querySelector<HTMLButtonElement>(
          `[data-delete="${destino}"]`,
        );
        disparador?.click();
      });
    });
  });
}

function initContextMenusGlobal() {
  initContextMenus();
}

initContextMenusGlobal();
document.addEventListener('astro:page-load', initContextMenusGlobal);

/**
 * Comportamiento del panel con forma de escritorio Windows.
 *
 * - Menú de la barra superior (abrir, cerrar, ejecutar).
 * - Plegado del panel lateral.
 * - Reloj de la barra de tareas.
 * - Atajos de teclado.
 * - Avisos flotantes (toasts) al estilo de Windows.
 *
 * El script se carga en cada navegación de Astro, así que todo se registra
 * una sola vez: los listeners de documento usan una bandera global y los de
 * elemento, una marca en el propio nodo.
 */

const FLAG = '__wtAdminDesktop';

/** Lanza un aviso en la esquina inferior derecha. */
export function toast(text: string, kind: 'ok' | 'error' | 'info' = 'info'): void {
  const area = document.querySelector<HTMLElement>('[data-toast-area]');
  if (!area) return;

  const nodo = document.createElement('div');
  nodo.className = 'win-toast';
  nodo.dataset.kind = kind;
  nodo.textContent = text;
  area.append(nodo);

  window.setTimeout(() => {
    nodo.style.opacity = '0';
    nodo.style.transition = 'opacity 220ms ease';
    window.setTimeout(() => nodo.remove(), 240);
  }, 4200);
}

function initMenus() {
  const disparadores = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.win-menubar-trigger'),
  ).filter((boton) => !boton.dataset.wtBound);
  if (disparadores.length === 0) return;

  const cerrarTodos = (except?: string) => {
    disparadores.forEach((boton) => {
      if (boton.dataset.menu === except) return;
      boton.setAttribute('aria-expanded', 'false');
      const panel = document.querySelector<HTMLElement>(
        `[data-menu-panel="${boton.dataset.menu}"]`,
      );
      if (panel) panel.hidden = true;
    });
  };

  disparadores.forEach((boton) => {
    boton.dataset.wtBound = 'true';

    boton.addEventListener('click', (event) => {
      event.stopPropagation();
      const abierto = boton.getAttribute('aria-expanded') === 'true';

      // Solo se abre el que se ha pulsado; los demás se cierran.
      disparadores.forEach((otro) => {
        if (otro === boton) return;
        otro.setAttribute('aria-expanded', 'false');
        const panel = document.querySelector<HTMLElement>(
          `[data-menu-panel="${otro.dataset.menu}"]`,
        );
        if (panel) panel.hidden = true;
      });

      boton.setAttribute('aria-expanded', String(!abierto));
      const panel = document.querySelector<HTMLElement>(
        `[data-menu-panel="${boton.dataset.menu}"]`,
      );
      if (panel) panel.hidden = abierto;
    });
  });

  document.addEventListener('click', () => cerrarTodos());
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') cerrarTodos();
  });
}

function initSidebar() {
  const boton = document.querySelector<HTMLButtonElement>('[data-sidebar-toggle]');
  const raiz = document.documentElement;

  // El estado se recuerda entre páginas y recargas.
  const guardado = window.localStorage.getItem('wt_admin_sidebar');
  if (guardado === 'collapsed') raiz.dataset.sidebar = 'collapsed';

  if (!boton || boton.dataset.wtBound) return;
  boton.dataset.wtBound = 'true';

  boton.addEventListener('click', () => {
    const plegado = raiz.dataset.sidebar === 'collapsed';
    raiz.dataset.sidebar = plegado ? 'expanded' : 'collapsed';
    window.localStorage.setItem('wt_admin_sidebar', raiz.dataset.sidebar ?? 'expanded');
  });
}

function initTree() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-tree-toggle]')
    .forEach((boton) => {
      if (boton.dataset.wtBound) return;
      boton.dataset.wtBound = 'true';

      const grupo = boton.closest<HTMLElement>('[data-tree-group]');
      if (!grupo) return;

      boton.addEventListener('click', () => {
        const abierto = grupo.classList.toggle('is-open');
        boton.setAttribute('aria-expanded', String(abierto));
      });
    });
}

function initReloj() {
  const reloj = document.querySelector<HTMLElement>('[data-clock]');
  if (!reloj) return;

  const pintar = () => {
    const ahora = new Date();
    const hora = new Intl.DateTimeFormat('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(ahora);
    const fecha = new Intl.DateTimeFormat('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(ahora);
    reloj.innerHTML = `<strong>${hora}</strong><small>${fecha}</small>`;
  };

  pintar();
  window.clearInterval(Number(reloj.dataset.timer ?? 0));
  reloj.dataset.timer = String(window.setInterval(pintar, 15000));
}

function initAccionesMenu() {
  document.addEventListener('click', (event) => {
    const boton = (event.target as HTMLElement).closest<HTMLElement>('[data-menu-action]');
    if (!boton) return;

    const accion = boton.dataset.menuAction;
    const raiz = document.documentElement;

    switch (accion) {
      case 'sitio':
        window.open('/', '_blank', 'noopener');
        break;
      case 'cuenta':
        window.open('/cuenta/login/', '_blank', 'noopener');
        break;
      case 'refrescar':
        window.location.reload();
        break;
      case 'panel':
        raiz.dataset.sidebar = raiz.dataset.sidebar === 'collapsed' ? 'expanded' : 'collapsed';
        window.localStorage.setItem('wt_admin_sidebar', raiz.dataset.sidebar ?? 'expanded');
        break;
      case 'nuevo': {
        // Depende de la sección: lleva al formulario de alta de esa sección.
        const alta = document.querySelector<HTMLAnchorElement>('[data-admin-nuevo]');
        if (alta) window.location.href = alta.href;
        else toast('Esta sección no tiene un formulario de alta.', 'info');
        break;
      }
      case 'buscar':
        document.querySelector<HTMLInputElement>('[data-admin-search]')?.focus();
        break;
      case 'atajos':
        toast('Atajos: Ctrl+K buscar · Ctrl+N nuevo · F5 refrescar · ? ayuda', 'info');
        break;
      case 'acerca':
        toast('Panel Windytech · versión 1.0 · sitio en español', 'info');
        break;
    }
  });
}

function initAtajos() {
  document.addEventListener('keydown', (event) => {
    const enCampo = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
      (event.target as HTMLElement)?.tagName ?? '',
    );

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      document.querySelector<HTMLInputElement>('[data-admin-search]')?.focus();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n' && !enCampo) {
      event.preventDefault();
      const alta = document.querySelector<HTMLAnchorElement>('[data-admin-nuevo]');
      if (alta) window.location.href = alta.href;
      return;
    }

    if (event.key === '?' && !enCampo) {
      event.preventDefault();
      toast('Atajos: Ctrl+K buscar · Ctrl+N nuevo · F5 refrescar · ? ayuda', 'info');
    }
  });
}

function initBotonesVentana() {
  document.addEventListener('click', (event) => {
    const boton = (event.target as HTMLElement).closest<HTMLElement>('[data-window-action]');
    if (!boton) return;

    const accion = boton.dataset.windowAction;

    if (accion === 'close') {
      const salir = document.querySelector<HTMLButtonElement>('[data-logout]');
      if (salir) salir.click();
      return;
    }

    if (accion === 'maximize') {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => undefined);
      } else {
        document.documentElement.requestFullscreen().catch(() => undefined);
      }
      return;
    }

    if (accion === 'minimize') {
      // "Minimizar" pliega el panel lateral: es la acción útil equivalente.
      const raiz = document.documentElement;
      raiz.dataset.sidebar = raiz.dataset.sidebar === 'collapsed' ? 'expanded' : 'collapsed';
      window.localStorage.setItem('wt_admin_sidebar', raiz.dataset.sidebar ?? 'expanded');
    }
  });
}

function initBuscadorMenu() {
  const input = document.querySelector<HTMLInputElement>('[data-admin-search]');
  const arbol = document.querySelector<HTMLElement>('[data-tree]');
  if (!input || !arbol || input.dataset.wtBound) return;
  input.dataset.wtBound = 'true';

  const grupos = Array.from(arbol.querySelectorAll<HTMLElement>('[data-tree-group]'));
  const enlaces = Array.from(arbol.querySelectorAll<HTMLAnchorElement>('.win-tree-link'));

  input.addEventListener('input', () => {
    const termino = input.value.trim().toLowerCase();

    if (termino.length === 0) {
      // Sin búsqueda se restaura el estado original de cada grupo.
      grupos.forEach((grupo) => {
        grupo.hidden = false;
        grupo.classList.add('is-open');
        grupo.querySelector('[data-tree-toggle]')?.setAttribute('aria-expanded', 'true');
        grupo.querySelectorAll<HTMLElement>('.win-tree-link').forEach((enlace) => {
          enlace.hidden = false;
        });
      });
      return;
    }

    let encontrados = 0;

    enlaces.forEach((enlace) => {
      const texto = enlace.textContent?.trim().toLowerCase() ?? '';
      const coincide = texto.includes(termino);
      enlace.hidden = !coincide;
      if (coincide) encontrados += 1;
    });

    grupos.forEach((grupo) => {
      const visibles = grupo.querySelectorAll<HTMLElement>('.win-tree-link:not([hidden])').length;
      const tiene = visibles > 0;
      grupo.hidden = !tiene;
      if (tiene) {
        grupo.classList.add('is-open');
        grupo.querySelector('[data-tree-toggle]')?.setAttribute('aria-expanded', 'true');
      }
    });

    input.dataset.resultados = String(encontrados);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const primero = enlaces.find((enlace) => !enlace.hidden);
    if (primero) window.location.href = primero.href;
  });
}

function init() {
  initMenus();
  initSidebar();
  initTree();
  initReloj();
  initBuscadorMenu();
}

// Los listeners de documento se registran una sola vez para toda la sesión.
const scope = window as unknown as Record<string, unknown>;
if (!scope[FLAG]) {
  scope[FLAG] = true;
  initAccionesMenu();
  initAtajos();
  initBotonesVentana();
}

init();
document.addEventListener('astro:page-load', init);

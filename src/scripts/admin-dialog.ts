/**
 * Diálogos del panel: ventanas modales con el aspecto de Windows.
 *
 * - Se abren con el botón que lleva `data-open-dialog="id"`.
 * - Se cierran con la X, con Escape o pulsando fuera del marco.
 * - Guardan el foco: al abrirse, el foco entra en el diálogo y al cerrarse
 *   vuelve al botón que lo abrió.
 */

function abrirDialogo(dialogo: HTMLElement, devolver?: HTMLElement | null) {
  dialogo.hidden = false;
  document.documentElement.style.overflow = 'hidden';
  dialogo.dataset.returnFocus = devolver?.id ?? '';

  // El foco entra en el primer control del diálogo.
  const foco = dialogo.querySelector<HTMLElement>(
    'input:not([type=hidden]), select, textarea, button:not([data-close-dialog])',
  );
  foco?.focus();
}

function cerrarDialogo(dialogo: HTMLElement) {
  dialogo.hidden = true;
  if (document.querySelector('.win-dialog:not([hidden])') === null) {
    document.documentElement.style.overflow = '';
  }

  const id = dialogo.dataset.returnFocus;
  if (id) document.getElementById(id)?.focus();
}

function initDialogos() {
  // Botones que abren.
  document.querySelectorAll<HTMLElement>('[data-open-dialog]').forEach((boton) => {
    if (boton.dataset.wtBound === 'true') return;
    boton.dataset.wtBound = 'true';

    boton.addEventListener('click', () => {
      const dialogo = document.getElementById(boton.dataset.openDialog ?? '');
      if (!dialogo) return;
      // Se le da un id al disparador para devolverle el foco al cerrar.
      if (!boton.id) boton.id = `disparador-${Math.random().toString(36).slice(2, 9)}`;
      abrirDialogo(dialogo, boton);
    });
  });

  // Botones que cierran (la X de cada diálogo).
  document.querySelectorAll<HTMLElement>('[data-close-dialog]').forEach((boton) => {
    if (boton.dataset.wtBound === 'true') return;
    boton.dataset.wtBound = 'true';

    boton.addEventListener('click', () => {
      const dialogo = boton.closest<HTMLElement>('.win-dialog');
      if (dialogo) cerrarDialogo(dialogo);
    });
  });

  // Clic fuera del marco: cierra.
  document.querySelectorAll<HTMLElement>('.win-dialog').forEach((dialogo) => {
    if (dialogo.dataset.wtBound === 'true') return;
    dialogo.dataset.wtBound = 'true';

    dialogo.addEventListener('click', (event) => {
      if (event.target === dialogo) cerrarDialogo(dialogo);
    });
  });
}

/* Escape cierra el diálogo abierto. Se registra una sola vez. */
const FLAG = '__wtAdminDialogos';
const scope = window as unknown as Record<string, unknown>;

if (!scope[FLAG]) {
  scope[FLAG] = true;
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const abierto = document.querySelector<HTMLElement>('.win-dialog:not([hidden])');
    if (abierto) cerrarDialogo(abierto);
  });
}

initDialogos();
document.addEventListener('astro:page-load', initDialogos);

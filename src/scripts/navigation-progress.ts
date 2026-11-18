/**
 * Barra de progreso de navegación para el ClientRouter de Astro.
 *
 * Además de dar feedback visual durante la carga, marca `window.__wtNavigating`
 * para que el sistema de datos en vivo no dispare transiciones de vista
 * mientras se está haciendo el swap (evita solapes). Se guarda en `window`
 * porque ClientRouter reemplaza los atributos de `<html>` en cada navegación.
 *
 * Los listeners se registran una sola vez: el componente se conserva con
 * `transition:persist`, así que sobrevive a los cambios de página.
 */

const SAFETY_MS = 8_000;
const navWindow = window as typeof window & { __wtNavigating?: boolean };

let finishTimer: number | undefined;
let safetyTimer: number | undefined;

function bar(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-nav-progress]');
}

function setProgress(value: number, visible = true): void {
  const node = bar();
  if (!node) return;
  node.classList.toggle('is-visible', visible);
  node.classList.remove('is-done');
  node.style.width = `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
}

function clearTimers(): void {
  if (finishTimer !== undefined) window.clearTimeout(finishTimer);
  if (safetyTimer !== undefined) window.clearTimeout(safetyTimer);
  finishTimer = undefined;
  safetyTimer = undefined;
}

function finish(): void {
  const wasNavigating = navWindow.__wtNavigating === true;
  clearTimers();
  navWindow.__wtNavigating = false;
  if (!wasNavigating) return; // carga inicial: no hay barra que completar

  setProgress(1);
  const node = bar();
  if (node) {
    node.classList.add('is-done');
    window.setTimeout(() => {
      node.classList.remove('is-visible', 'is-done');
      node.style.width = '0%';
    }, 260);
  }
}

function start(): void {
  clearTimers();
  navWindow.__wtNavigating = true;
  setProgress(0.12);
  safetyTimer = window.setTimeout(finish, SAFETY_MS);
}

document.addEventListener('astro:before-preparation', start);
document.addEventListener('astro:after-preparation', () => setProgress(0.7));
document.addEventListener('astro:after-swap', () => {
  setProgress(0.9);
  finishTimer = window.setTimeout(finish, 180);
});
document.addEventListener('astro:page-load', finish);

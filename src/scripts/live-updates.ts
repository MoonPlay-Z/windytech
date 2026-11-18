/**
 * Sistema de actualización en vivo.
 *
 * - Descubre fuentes marcadas con `data-live-values` / `data-live-orders`.
 * - Consulta sus endpoints en segundo plano (pausado cuando la pestaña está
 *   oculta) y aplica los cambios dentro de `startViewTransition()` para que la
 *   actualización se vea fluida en lugar de "saltar".
 * - Se reinicia en `astro:page-load` y se limpia en `astro:before-swap`, igual
 *   que el resto de scripts del proyecto, para no duplicar timers ni listeners.
 *
 * Las clases CSS de animación viven en `src/styles/live.css`.
 */

import { liveValueChanged, newOrderIds, orderTone } from '../lib/live';

type TransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

interface LiveTask {
  host: HTMLElement;
  run: (signal: AbortSignal) => Promise<void>;
  interval: number;
  inFlight: boolean;
  timer?: number;
  tick?: () => void;
}

const DEFAULT_INTERVAL = 30_000;
const MIN_INTERVAL = 5_000;
const MAX_INTERVAL = 15 * 60_000;

// ClientRouter cambia los atributos de <html> en cada swap; window sobrevive.
const navWindow = window as typeof window & { __wtNavigating?: boolean };

let controller: AbortController | null = null;
let tasks: LiveTask[] = [];

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isNavigating(): boolean {
  return navWindow.__wtNavigating === true;
}

/** Aplica un cambio de DOM con transición de vista cuando es seguro hacerlo. */
function applyChange(update: () => void): void {
  const doc = document as TransitionDocument;
  if (!isNavigating() && !prefersReducedMotion() && typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(update);
    return;
  }
  update();
}

/** Destello breve en el valor que cambió (se limpia solo al terminar). */
function flash(node: HTMLElement): void {
  if (prefersReducedMotion()) return;
  node.classList.remove('is-live-updated');
  void node.offsetWidth; // fuerza reflow para reiniciar la animación
  node.classList.add('is-live-updated');
  node.addEventListener('animationend', () => node.classList.remove('is-live-updated'), {
    once: true,
  });
}

/** Varias zonas pueden compartir el mismo endpoint en un mismo ciclo. */
const inflightByUrl = new Map<string, Promise<unknown>>();

function getJson(url: string, signal: AbortSignal): Promise<unknown> {
  const shared = inflightByUrl.get(url);
  if (shared) return shared;

  const request = fetch(url, {
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    signal,
  })
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null)
    .finally(() => inflightByUrl.delete(url));

  inflightByUrl.set(url, request);
  return request;
}

function intervalFrom(host: HTMLElement): number {
  const raw = Number(host.dataset.liveInterval);
  if (!Number.isFinite(raw)) return DEFAULT_INTERVAL;
  return Math.min(MAX_INTERVAL, Math.max(MIN_INTERVAL, raw));
}

function createValueTask(host: HTMLElement): LiveTask {
  return {
    host,
    interval: intervalFrom(host),
    inFlight: false,
    run: async (signal) => {
      const url = host.dataset.liveUrl;
      if (!url) return;
      const payload = await getJson(url, signal);
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return;
      const data = payload as Record<string, unknown>;

      const pending: Array<() => void> = [];
      host.querySelectorAll<HTMLElement>('[data-live-key]').forEach((node) => {
        const key = node.dataset.liveKey;
        if (!key) return;
        const raw = data[key];
        const next = String(raw ?? 0);
        if (!liveValueChanged(node.textContent, next)) return;
        pending.push(() => {
          node.textContent = next;
          flash(node);
        });
      });
      if (pending.length) applyChange(() => pending.forEach((change) => change()));
    },
  };
}

interface LiveOrder {
  id: number;
  status: string;
}

function createOrdersTask(host: HTMLElement): LiveTask {
  return {
    host,
    interval: intervalFrom(host),
    inFlight: false,
    run: async (signal) => {
      const url = host.dataset.liveUrl ?? '/api/admin/purchase-orders';
      const payload = await getJson(url, signal);
      if (!payload || typeof payload !== 'object') return;
      const list = (payload as { orders?: unknown }).orders;
      if (!Array.isArray(list)) return;
      const orders = list
        .filter((item): item is LiveOrder =>
          Boolean(item) && typeof item === 'object' &&
          typeof (item as LiveOrder).id === 'number' &&
          typeof (item as LiveOrder).status === 'string',
        );

      const pending: Array<() => void> = [];
      const knownIds: number[] = [];

      host.querySelectorAll<HTMLTableRowElement>('[data-order-row][data-order-id]').forEach((row) => {
        const id = Number(row.dataset.orderId);
        if (!Number.isFinite(id)) return;
        knownIds.push(id);
        const order = orders.find((item) => item.id === id);
        if (!order || row.dataset.status === order.status) return;
        const badge = row.querySelector<HTMLElement>('[data-live-order-status]');
        if (!badge) return;
        const tone = orderTone(order.status);
        pending.push(() => {
          row.dataset.status = order.status;
          badge.className = `orders-status orders-status--${tone}`;
          badge.textContent = badge.dataset.statusLabel ?? badge.textContent ?? '';
          flash(badge);
        });
      });

      const count = host.querySelector<HTMLElement>('[data-live-count]');
      if (count) {
        const next = String(orders.length);
        if (liveValueChanged(count.textContent, next)) {
          pending.push(() => {
            count.textContent = next;
            flash(count);
          });
        }
      }

      if (pending.length) applyChange(() => pending.forEach((change) => change()));

      const fresh = newOrderIds(knownIds, orders.map((order) => order.id));
      if (fresh.length) {
        const toast = host.querySelector<HTMLElement>('[data-live-toast]');
        if (toast && toast.hidden) {
          const label = toast.querySelector<HTMLElement>('[data-live-toast-label]');
          if (label) {
            label.textContent = `${fresh.length} ${fresh.length === 1 ? 'orden nueva' : 'órdenes nuevas'}`;
          }
          toast.hidden = false;
        }
      }
    },
  };
}

/** Ejecuta una tarea ahora y la programa de forma periódica. */
function schedule(task: LiveTask, signal: AbortSignal): void {
  const tick = () => {
    if (document.hidden || task.inFlight || signal.aborted) return;
    task.inFlight = true;
    void task
      .run(signal)
      .catch(() => {
        // Sin conexión o endpoint temporalmente caído: se reintenta luego.
      })
      .finally(() => {
        task.inFlight = false;
      });
  };

  task.tick = tick;
  void tick();
  task.timer = window.setInterval(tick, task.interval);
  signal.addEventListener('abort', () => {
    if (task.timer !== undefined) window.clearInterval(task.timer);
  }, { once: true });
}

function stopLiveUpdates(): void {
  controller?.abort();
  controller = null;
  tasks = [];
}

function initLiveUpdates(): void {
  stopLiveUpdates();
  controller = new AbortController();
  const { signal } = controller;

  const values = document.querySelectorAll<HTMLElement>('[data-live-values]');
  const orders = document.querySelectorAll<HTMLElement>('[data-live-orders]');
  if (!values.length && !orders.length) return;

  tasks = [
    ...[...values].map(createValueTask),
    ...[...orders].map(createOrdersTask),
  ];
  tasks.forEach((task) => schedule(task, signal));

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tasks.forEach((task) => task.tick?.());
  }, { signal });
}

function boot(): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiveUpdates, { once: true });
  } else {
    initLiveUpdates();
  }
  document.addEventListener('astro:page-load', initLiveUpdates);
  document.addEventListener('astro:before-swap', stopLiveUpdates);

  // Cierre delegado del aviso: sigue funcionando aunque el nodo se haya
  // renderizado en una página distinta dentro del mismo ClientRouter.
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest('[data-live-toast-close]')) return;
    const toast = target.closest('[data-live-toast]');
    if (toast instanceof HTMLElement) toast.hidden = true;
  });
}

boot();

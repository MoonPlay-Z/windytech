# Sistema de actualización en tiempo real

Dos piezas complementarias para que la navegación y los datos se sientan fluidos:

1. **Navegación con ClientRouter**: transiciones de vista, barra de progreso y
   precarga de enlaces (ya presente en `astro.config.mjs`).
2. **Datos en vivo**: sondeo en segundo plano que actualiza valores del DOM sin
   recargar la página, con animación al cambiar.

---

## 1. Navegación fluida

- `BaseLayout.astro` y `AdminLayout.astro` incluyen `<ClientRouter />` y el
  componente `NavigationProgress.astro`.
- `src/scripts/navigation-progress.ts` escucha los eventos del router:

  | Evento | Acción |
  | --- | --- |
  | `astro:before-preparation` | Muestra la barra al 12 % y marca `window.__wtNavigating` |
  | `astro:after-preparation` | Avanza al 70 % |
  | `astro:after-swap` | Avanza al 90 % |
  | `astro:page-load` | Completa al 100 % y oculta |

  Hay un temporizador de seguridad de 8 s por si una navegación falla. El
  marcador `window.__wtNavigating` evita que el motor de datos en vivo inicie
  una transición de vista mientras se está haciendo el swap. Se guarda en
  `window` porque ClientRouter reemplaza los atributos de `<html>`.

- La barra lleva `transition:persist`, así que no se redibuja en cada salto.
- `::view-transition-old(root)` desliza la página saliente y
  `::view-transition-new(root)` entra con un fundido corto (`wt-page-in`).
  Cabecera, barra de campaña, botón de WhatsApp, pie y menú lateral mantienen
  su `view-transition-name` y permanecen quietos.
- Todo está dentro de `@media (prefers-reduced-motion: no-preference)` (también
  en el panel); con el ajuste de movemento reducido las animaciones se desactivan.

## 2. Datos en vivo

### Fuentes declaradas en el HTML

| Atributo | Significado |
| --- | --- |
| `data-live-values` | Contenedor cuyos `[data-live-key]` se rellenan con un JSON plano |
| `data-live-orders` | Contenedor de la tabla de órdenes: actualiza estados, total y aviso |
| `data-live-url` | Endpoint a consultar (por defecto `/api/admin/purchase-orders` en órdenes) |
| `data-live-interval` | Intervalo en ms (mínimo 5 s, máximo 15 min; por defecto 30 s) |
| `data-live-key` | Clave del JSON que alimenta ese nodo |
| `data-live-count` | Nodo con el total de órdenes |
| `data-order-id` / `data-live-order-status` | Fila y badge de estado que se actualizan |
| `data-live-toast` / `data-live-toast-label` / `data-live-toast-close` | Aviso de nuevos registros |

Fuentes actuales:

- Panel (`/admin/`): tarjetas de métricas y embudo →
  `/api/admin/live/stats` (20 s).
- Órdenes (`/admin/ordenes/`): estados, total y aviso de órdenes nuevas →
  `/api/admin/purchase-orders` (15 s).
- Insignia de novedades del cliente: el polling existente de
  `customer-notifications.ts` ahora usa la misma animación `.is-live-updated`.

### Motor cliente

`src/scripts/live-updates.ts`:

- Descubre las fuentes en `DOMContentLoaded` y en cada `astro:page-load`.
- Busca `document.hidden` para no gastar peticiones en pestañas inactivas y
  refresca al volver a la pestaña.
- Dedupe peticiones al mismo endpoint dentro de un ciclo.
- Aplica los cambios dentro de `startViewTransition()` (si el navegador lo
  soporta y no hay movimiento reducido) para que el valor cambie con un
  fundido en vez de saltar.
- Añade `.is-live-updated` al nodo modificado: un destello verde de 900 ms que
  se limpia solo al terminar la animación.
- Cancela timers y aborta `fetch` en `astro:before-swap`, por lo que no se
  acumulan intervalos al navegar.

### Endpoints

- `GET /api/admin/live/stats` → métricas del panel. Requiere sesión de admin y
  devuelve `Cache-Control: private, no-store`. Usa `countAdminStats()` (una
  sola consulta SQL con subconsultas `COUNT`).
- `GET /api/admin/purchase-orders` → ya existente; se reutiliza para órdenes.

Todas las peticiones son `same-origin`, coherentes con `connect-src 'self'` del
CSP de producción.

### Helpers puros

`src/lib/live.ts` contiene `parseLiveStats`, `orderTone`, `newOrderIds` y
`liveValueChanged`. Están cubiertos por `src/lib/live.test.ts` (node:test, sin
DOM).

## 3. Añadir una nueva fuente en vivo

1. Crear o reutilizar un endpoint `GET` con `requireAdmin` (o
   `customerSessionFromRequest`) y `Cache-Control: no-store`.
2. Marcar el contenedor con `data-live-values`, `data-live-url` y, si hace falta,
   `data-live-interval`.
3. Añadir `data-live-key="clave"` a cada valor que debe actualizarse.
4. Si el nuevo valor es de otro tipo (listas, HTML), ampliar el motor con una
   tarea dedicada siguiendo el patrón de `createOrdersTask`.
5. Comprobar que cualquier clase nueva tiene regla en `src/styles/live.css` y
   ejecutar `npm run css:audit`.

## 4. Verificación

```bash
npm run css:audit   # clases huérfanas / sin estilo
npm run check       # tipos y plantillas
npm test            # incluye src/lib/live.test.ts
npm run build
```

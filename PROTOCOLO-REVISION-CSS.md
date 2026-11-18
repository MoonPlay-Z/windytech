# Protocolo de revisión de CSS y clases

Estado: **auditoría limpia** (`npm run css:audit` → `✔ 617 clases definidas, todas usadas y con estilo`).

Este documento deja constancia de los fallos de diseño encontrados, qué se corrigió y
cómo revisar cualquier cambio futuro de CSS o de clases en plantillas.

---

## 1. Contexto

El proyecto usa **CSS global plano** (sin Tailwind, CSS Modules ni estilos
scoped de Astro) repartido en 11 archivos (~9.500 líneas):

| Archivo | Rol |
| --- | --- |
| `src/styles/global.css` | Reset, tokens y marketing (layout, header, hero, planes, footer…) |
| `src/styles/catalog.css` | Catálogo, filtros y tarjetas de producto/proyecto/blog |
| `src/styles/detail.css` | Detalle de producto, artículos y cotizaciones |
| `src/styles/cart.css` | Carrito y checkout |
| `src/styles/account.css` | Área de cliente y seguimiento público |
| `src/styles/admin.css` | Panel de administración |
| `src/styles/live.css` | Barra de progreso, destello de datos en vivo y avisos |
| `src/styles/responsive/*.css` | Ajustes por dispositivo, dentro de `@layer responsive` |

El sistema de actualización en tiempo real está descrito en `SISTEMA-TIEMPO-REAL.md`.

Los estilos se importan desde `BaseLayout.astro`, `AdminLayout.astro` y las páginas
que los necesitan. `astro.config.mjs` usa `build.inlineStylesheets: 'always'`.

**No hay tooling de CSS**: ni PostCSS, ni Stylelint, ni reglas de Astro que
detecten clases huérfanas. Por eso existía CSS muerto y clases sin estilo sin que
fallara `npm run check`. `scripts/audit-css.mjs` cubre ese hueco.

---

## 2. Fallos corregidos en esta revisión

### 2.1 Clases CSS sin ningún uso (eliminadas)

| Clase | Archivo | Motivo |
| --- | --- | --- |
| `.card--dark` (+ `h3`, `p`, `.tag`) | `global.css` | Ninguna plantilla la aplicaba |
| `.lang-switch` (+ `:hover`) | `global.css` | Sitio solo en español; `/en/*` redirige |
| `.quick-wa`, `.quick-link.is-primary .quick-wa` | `global.css` | Icono de WhatsApp ya no se usa ahí |
| `.sr-only` | `global.css` | Utilidad de accesibilidad sin uso |
| `.icon-badge--card` | `global.css` | Ningún dato genera `icon: 'card'` |
| `.plan-link--share` | `global.css` | Botón compartir migrado a `ShareMenu`/`ShareBar` |
| `.header-cta` | `responsive/tablet.css` | Selector responsive sin elemento en el DOM |
| `.product-price-note` (+ variante en `detail.css`) | `catalog.css`, `detail.css` | Sin referencias en plantillas |
| `.uploader-label` | `admin.css` | Se eliminó del grupo de selectores; queda `.uploader-alt` |

### 2.2 Clases en plantillas sin regla CSS (corregidas)

| Clase | Acción |
| --- | --- |
| `ml-2` (`Header.astro`) | Eliminada: residuo de utility de Tailwind en un proyecto sin Tailwind |
| `account-layout--profile` (3 páginas de cuenta) | Eliminada: `.account-layout` base ya aplica |
| `artwork--${theme}` (`Artwork.astro`) | Eliminada: no tenía CSS ni JS que la usara; el tema se resuelve en el SVG |
| `share-menu--card` (`ShareMenu.astro`) | Eliminada: solo `--detail` tiene regla; ahora el modificador se aplica en condicional |
| `quote-section`, `tracking-public` | Eliminadas: `section section--soft` ya aporta el estilo |
| `cart-link`, `cart-count` (`Header.astro`) | Añadidas reglas en `global.css` (iconos y badge del carrito) |
| `currency-switch`, `currency-note` | Añadidas reglas en `global.css` (catálogo y carrito) |
| `share-box--inline` | Añadida regla en `global.css` |
| `search-preview__text` | Añadida regla (`min-width: 0`) en `global.css` |
| `catalog-hero-copy` | Añadida regla (`min-width: 0`) en `catalog.css` |
| `variant-out` | Añadida regla en `detail.css` |
| `admin-field`, `admin-field--password`, `admin-tag` | Añadidas reglas en `admin.css` |
| `admin-stat--products` | Añadida regla en `admin.css` (las demás variantes ya existían) |
| `orders-search`, `orders-status-filter`, `orders-date-filter`, `orders-products-cell` | Añadidas reglas en `admin.css` |
| `tracking-notice` | Añadida al selector existente `.tracking-notice-list li` en `account.css` |

### 2.3 Otros fallos sueltos

- **Duplicado `scroll-margin-top`**: `global.css` definía `96px` para
  `section[id], article[id]` y `104px` para `:target, section[id], [id]`.
  Se eliminó la primera (ganaba siempre la segunda).
- **Duplicado `.nav-badge`**: al añadir `.cart-count` se unificaron ambas reglas
  en un único bloque para no repetir propiedades.

---

## 3. Hallazgos pendientes (documentados, no modificados)

Se dejaron sin cambiar a propósito: implican riesgo de regresión visual y
requieren revisión en navegador. Orden por prioridad.

1. **Cascada de capas rota** (prioridad alta). `@layer base {` se cierra antes
   de final de archivo en cuatro hojas: `global.css:3027` de 3.807 líneas,
   `admin.css:1071` de 1.915, `catalog.css:567` de 587 y `account.css:195` con un
   segundo `@layer base {` en `647`. El resto queda **sin capa** y gana a todo lo
   que esté en `@layer responsive`. Consecuencia: los ajustes responsive pueden
   ser ignorados. `detail.css` y `cart.css` sí están correctamente cerrados al final.
   *Acción recomendada*: llevar el `}` de cierre al final de cada archivo, quitar
   la reapertura en `account.css` y validar visualmente móvil/tablet/escritorio.

2. **Bloques duplicados en `admin.css`**. Existe una segunda pasada
   ("Refined admin workspace", desde ~`admin.css:476`) que redefine
   `.admin-shell`, `.admin-sidebar`, `.admin-brand`, `.admin-nav`, `.admin-main`,
   `.admin-card`, `.admin-grid`, `.admin-stat`, `.admin-login`, etc. Conviene
   consolidar en una sola definición por selector.

3. **`!important` excesivo** (~18 usos). La mayoría está justificada
   (`[hidden]`, rellenos SVG animados, `prefers-reduced-motion`), pero hay
   valores pequeños forzados que huelen a deuda: `admin.css:204` (`display`),
   `admin.css:763` (`font-size: 9px`), `admin.css:1694-1695`,
   `detail.css:1197` (`font-size: 13.5px`) y `responsive/tablet.css:113`.

4. **Sin escala de `z-index`**. Valores ad hoc (`-1, 0, 1, 2, 40, 50, 60, 100`)
   repartidos entre `global.css`, `catalog.css` y `admin.css`. `40` se usa para
   menús de compartir en dos archivos distintos. Recomendado: tokens
   `--z-base`, `--z-sticky`, `--z-dropdown`, `--z-modal`.

5. **Colores repetidos en lugar de tokens**. `--bg`, `--mint`, `--teal-dark`…
   existen, pero siguen apareciendo literales como `#f3f7f8`, `#fff`,
   `#fdecea`, `#b56a10`, `#9c2929`, `#fbfdfd`, `#eaf3fb`. Sustituir por
   variables para evitar divergencias.

6. **Breakpoints inconsistentes**. Conviven 1180, 1100, 1024, 980, 900, 860,
   760, 720, 680, 640, 620, 600, 560, 480, 460, 420 y 380 px. Además hay
   `@media` dentro de los archivos base (`global.css`, `admin.css`,
   `catalog.css`, `detail.css`, `account.css`) aunque `responsive/index.css`
   dice que los ajustes de dispositivo viven ahí. Unificar en unos pocos tokens
   de breakpoint.

7. **Convenciones mixtas**. BEM (`product-specs__table`, `.is-*`, `.has-*`)
   convive con kebab-case plano (`quick-link`, `catalog-field`), y hay
   modificadores duplicados (`--sm` vs `--small`, `is-` vs `--`).

8. **Bloques `prefers-reduced-motion` consecutivos** en `global.css`
   (~3041 y ~3049) más uno `no-preference`; se pueden fusionar.

---

## 4. Auditoría automática

```bash
npm run css:audit
```

`scripts/audit-css.mjs` hace tres cosas:

1. Extrae todas las clases definidas en `src/styles/**/*.css`
   (ignora comentarios y cadenas).
2. Recorre `.astro`, `.ts`, `.tsx`, `.js`, `.mjs` e `.html` y comprueba que
   cada clase aparece en algún sitio: `class`, `class:list`, `classList.add`,
   props, etc.
3. Detecta clases de plantilla sin regla CSS y las lista.

Sale con `0` cuando no hay incidencias y con `1` cuando las hay, así que se
puede añadir a CI sin cambios.

### Clases dinámicas (no son falsos positivos)

El script reconoce patrones generados en tiempo de ejecución:

- `is-${estado}` → cualquier `is-*` existente en CSS se considera usada
  (estados de cotización, disponibilidad y badges de seguimiento).
- `prefijo--${valor}` → se detecta el prefijo (`icon-badge--`, `quick-icon--`,
  `payment-pill--`, `orders-status--`, `contact-card-icon--`,
  `panel-chip-icon--`, `product-highlight-card--`, `share-box--`) y se valida
  que el sufijo aparece en los datos.

Si se introduce un prefijo dinámico nuevo con un sufijo que no aparece como
texto en el código (por ejemplo un valor que venga de la base de datos), hay
que documentarlo aquí en lugar de relajarlo en el script.

---

## 5. Checklist de revisión

Aplicar **antes de dar por terminado** cualquier cambio que toque CSS o clases:

- [ ] `npm run css:audit` → 0 incidencias.
- [ ] `npm run check && npm test` → sin errores de tipos ni tests rotos.
- [ ] `npm run build` → compile (incluye regeneración de sitemap).
- [ ] La clase nueva tiene **una** definición CSS; si es modificador, el
      prefijo dinámico se detecta o se documenta en el §4.
- [ ] No se añade ninguna clase sin regla CSS (ni utilidades sueltas tipo
      `ml-2`). Si es un hook exclusivo de JS, usar `data-*` en vez de `class`.
- [ ] Se usan los tokens existentes (`--bg`, `--mint`, `--radius`, …) antes
      que colores o tamaños literales.
- [ ] No se añade `!important` salvo que sea imprescindible y esté justificado
      en un comentario.
- [ ] Los cambios responsive van en `src/styles/responsive/*.css`, no en un
      `@media` nuevo dentro de un archivo base (hasta resolver el §3.1).
- [ ] Se comprueba la página afectada en móvil (≤420), tablet (≈768) y
      escritorio (≥1181).
- [ ] Si se elimina una clase, se buscan primero usos dinámicos en `src/data/`
      y en `class:list`/`classList` antes de borrar la regla.

---

## 6. Reglas de nomenclatura

- **Bloque**: kebab-case descriptivo (`product-card`, `tracking-notice`).
- **Elemento**: `bloque__elemento` (`product-specs__table`).
- **Modificador**: `bloque--variante` (`card--soft`, `share-box--card`).
- **Estado**: `is-*` (transitorio, lo pone el JS) o `has-*` (presencia de
  contenido), p. ej. `is-open`, `has-open-share`.
- **Hooks JS**: atributos `data-*`, nunca clases vacías de estilo.
- Un modificador nuevo debe añadirse también al grupo de selectores donde
  se aplica (p. ej. `admin-stat--<nombre> .admin-stat-icon`).

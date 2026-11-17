# Manual de SEO manual — Windytech

Guía operativa para las tareas de SEO que **no puede hacer el código** y que dependen de
cuentas externas: buscadores, redes sociales, fichas de empresa y analítica.

> Estado del sitio: `https://windytech.studio` · Astro SSR en Render · solo español ·
> sitemap con 32 URLs · feed del blog en `/blog/rss.xml`.
>
> Lo que ya está automatizado: metadatos, canonical, Open Graph, JSON-LD, sitemap con
> imágenes, feed RSS, 404 reales, `robots.txt`, verificación de Google y Bing, y el script
> de IndexNow. Este manual cubre lo demás.

---

## 0. Datos que vas a usar

| Dato | Valor |
|---|---|
| Dominio canónico | `https://windytech.studio` |
| Sitemap | `https://windytech.studio/sitemap.xml` |
| Feed del blog | `https://windytech.studio/blog/rss.xml` |
| Verificación Google | `src/data/site.ts` → `site.verification.google` (ya activa) |
| Verificación Bing | `src/data/site.ts` → `site.verification.bing` (ya activa) |
| Clave IndexNow | `3912b45e618c49a3694bc4c10ff020f4` (archivo en `/3912b45e...txt`) |
| Perfiles sociales | `src/data/empresa.ts` → `PROFILES` |
| Ficha de Google | `src/data/empresa.ts` → `googleProfileUrl` y `reviewUrl` |
| Ficha de Bing | `src/data/empresa.ts` → `bingPlacesUrl` |
| Usuario de X | `src/data/site.ts` → `twitter` |
| Comprobación SEO | `npm run seo:check -- --site=https://windytech.studio` |
| Aviso a buscadores | `npm run build && npm run indexnow` |

### Cuentas que debes tener a mano

- Google Search Console
- Bing Webmaster Tools
- Google Business Profile
- Bing Places
- Las cuentas de Facebook, Instagram, LinkedIn, X, GitHub y YouTube de Windytech
- Un gestor de automatizaciones: Zapier, Make, Buffer o IFTTT (solo uno)
- Analítica: Plausible, Umami o GA4 (solo uno)

---

## 1. Checklist inicial (hazlo una sola vez)

| # | Tarea | Herramienta | Estado |
|---|---|---|---|
| 1 | Verificar la propiedad del dominio | Search Console | ✅ ya verificado |
| 2 | Enviar el sitemap | Search Console | ⬜ pendiente |
| 3 | Importar desde Google y enviar sitemap | Bing Webmaster | ⬜ pendiente |
| 4 | Ejecutar IndexNow tras el primer despliegue | `npm run indexnow` | ⬜ pendiente |
| 5 | Crear o reclamar la ficha de empresa | Google Business Profile | ⬜ pendiente |
| 6 | Crear o reclamar la ficha de Bing | Bing Places | ⬜ pendiente |
| 7 | Rellenar los perfiles sociales reales | `src/data/empresa.ts` | ⬜ pendiente |
| 8 | Añadir el usuario de X | `src/data/site.ts` | ⬜ pendiente |
| 9 | Conectar el feed RSS a las redes | Zapier / Make / Buffer | ⬜ pendiente |
| 10 | Instalar analítica | Plausible / Umami / GA4 | ⬜ pendiente |
| 11 | Probar las vistas previas sociales | Debuggers | ⬜ pendiente |
| 12 | Validar datos estructurados | Rich Results Test | ⬜ pendiente |

Anota la fecha de cada paso en el registro del final.

---

## 2. Google Search Console

**Herramienta:** <https://search.google.com/search-console>

### 2.1 Verificar la propiedad

Ya está verificado por dos vías:

- Archivo `public/de7be1f2-4139-4e1c-8932-3fcb990ee688.html`
- Etiqueta `google-site-verification` generada desde `src/data/site.ts`

Si algún día hay que repetirlo, en Search Console elige **Prefijo de URL**
(`https://windytech.studio/`) y usa el método **Etiqueta HTML**: pega el código en
`site.verification.google`, despliega y pulsa **Verificar**.

### 2.2 Enviar el sitemap

1. Entra en **Sitemaps**.
2. Escribe `sitemap.xml` y pulsa **Enviar**.
3. Comprueba que el estado sea **Correcto** y que el número de URLs coincida con el build
   actual (hoy 32).
4. Si más adelante cambias slugs o añades secciones, vuelve a enviarlo.

El sitemap incluye imágenes de productos, publicaciones y proyectos. Google las descubre
al rastrear el sitemap y las usa en Google Imágenes.

### 2.3 Pedir indexación de una página nueva

1. Pega la URL completa en la barra superior (**Inspeccionar cualquier URL**).
2. Espera el resultado.
3. Si dice “La URL no está en Google”, pulsa **Solicitar indexación**.
4. Hazlo solo con páginas importantes y recién publicadas; hay un límite diario.

### 2.4 Revisar la indexación

En **Páginas** (dentro de Indexación):

| Estado | Qué significa | Qué hacer |
|---|---|---|
| Correcta | Indexada | Nada |
| Rastreada, no indexada | Google la conoce pero no la muestra | Revisar contenido, enlaces internos y canonical |
| Duplicada sin canónica | Hay otra URL elegida | Revisar `canonical` |
| Soft 404 | Página vacía o redirección | Debe devolver 404 real (ya corregido) |
| Bloqueada por robots | `robots.txt` o `noindex` | Revisar `noindex` solo en admin/cuenta |
| Error 5xx | Fallo del servidor | Revisar Render |

### 2.5 Rendimiento

En **Rendimiento** revisa cada mes:

- **Consultas**: separa marca (“windytech”) de consultas genéricas.
- **Páginas**: qué páginas reciben impresiones y cuáles no.
- **Países y dispositivos**: confirma que llega Venezuela y el resto de Latinoamérica.
- **CTR bajo con muchas impresiones**: mejora el título y la meta descripción.

Filtra por consultas con posición 5–20: son las oportunidades más fáciles de subir.

### 2.6 Experiencia y mejoras

- **Core Web Vitals**: mide con <https://pagespeed.web.dev/> y corrige lo que marque.
- **Datos estructurados**: deben aparecer `Product`, `Breadcrumb` y `Article` sin errores.
- **HTTPS**: debe estar todo en verde.

---

## 3. Bing Webmaster Tools e IndexNow

**Herramienta:** <https://www.bing.com/webmasters>

### 3.1 Configurar

1. Entra con la cuenta de Google o Microsoft.
2. Usa **Importar desde Google Search Console**; ahorra la verificación.
3. En **Sitemaps** envía `https://windytech.studio/sitemap.xml`.
4. En **URL Submission** puedes enviar URLs nuevas (límite diario).

Bing alimenta también DuckDuckGo y Yahoo, así que no es opcional.

### 3.2 IndexNow

IndexNow avisa a Bing, Yandex, Seznam, Naver y Brave de que una URL cambió. Google **no**
usa IndexNow, pero Bing sí.

Después de cada despliegue con cambios de contenido:

```bash
npm run build
npm run indexnow
```

Debe responder `IndexNow: 200 OK` o `202 Accepted`. La clave pública está en
`https://windytech.studio/3912b45e618c49a3694bc4c10ff020f4.txt` y debe seguir existiendo.

Si responde `403`, revisa que la clave del script coincida con el archivo y que el host sea
`windytech.studio`.

---

## 4. Fichas de empresa (SEO local)

### 4.1 Google Business Profile

**Herramienta:** <https://business.google.com/>

1. Crea o reclama la ficha de **Windytech**.
2. Categoría principal: la que mejor describa el servicio (por ejemplo, desarrollo de
   software o servicios informáticos).
3. Si no hay local físico, configura **área de servicio** (Venezuela y ciudades donde
   trabajas). No inventes una dirección.
4. Completa horario, teléfono, correo, sitio web y descripción.
5. Sube logo, portada y fotos reales de trabajos.
6. Publica una novedad cada 1–2 semanas (puede ser el mismo artículo del blog).
7. Pide reseñas a clientes reales y responde todas.

Cuando tengas la ficha:

```ts
// src/data/empresa.ts
googleProfileUrl: 'https://g.page/tu-ficha',
reviewUrl: 'https://g.page/r/TU_ID/review',
```

El botón de reseña se muestra solo cuando `reviewUrl` tiene valor.

### 4.2 Bing Places

**Herramienta:** <https://www.bingplaces.com/>

1. Importa la ficha desde Google Business Profile.
2. Confirma los mismos datos (nombre, teléfono, web, horario).
3. Guarda la URL en `bingPlacesUrl`.

### 4.3 Apple Business Connect

**Herramienta:** <https://businessconnect.apple.com/>

Opcional, pero mejora la presencia en Mapas de Apple. Usa exactamente el mismo nombre,
teléfono y web.

### 4.4 Consistencia NAP

El nombre, la dirección (o área de servicio) y el teléfono deben ser idénticos en todos los
perfiles. Una diferencia de formato puede dividir la entidad a ojos de Google.

---

## 5. Perfiles sociales y `sameAs`

Esto es lo que elimina el último aviso de `npm run seo:check`.

Edita `src/data/empresa.ts` y rellena solo las redes que existan de verdad:

```ts
const PROFILES: SocialProfile[] = [
  { name: 'Facebook', url: 'https://www.facebook.com/tu-pagina/' },
  { name: 'Instagram', url: 'https://www.instagram.com/tu-cuenta/' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/company/tu-empresa/' },
  { name: 'X', url: 'https://x.com/tu-cuenta' },
  { name: 'GitHub', url: 'https://github.com/tu-cuenta' },
  { name: 'YouTube', url: 'https://www.youtube.com/@tu-canal' },
];
```

Si una red todavía no existe, deja `url: ''`: es mejor un enlace menos que un enlace roto.

También puedes añadir el usuario de X para las tarjetas:

```ts
// src/data/site.ts
twitter: '@windytech',
```

Después:

1. `npm run build` y despliega.
2. Comprueba que los iconos aparecen en el pie de página.
3. Valida el `Organization` en <https://validator.schema.org/>: debe incluir `sameAs`.
4. Vuelve a pasar `npm run seo:check -- --site=https://windytech.studio`.

---

## 6. Vistas previas al compartir

Cada red guarda una caché de la imagen y el texto. Cuando cambies una portada o un título,
fuerza la actualización.

| Red | Herramienta | Qué hacer |
|---|---|---|
| Facebook | <https://developers.facebook.com/tools/debug/> | Pega la URL → **Scrape Again** |
| LinkedIn | <https://www.linkedin.com/post-inspector/> | Pega la URL → **Inspect** |
| Telegram | <https://t.me/WebpageBot> | Envía el enlace y pulsa actualizar |
| WhatsApp | Sin depurador oficial | Añade `?v=2` al enlace para forzar una vista nueva |
| X | El validador público ya no está disponible | Publica un borrador o usa el composer para ver la tarjeta |

Qué debe verse:

- Título y descripción correctos.
- Imagen 1200×630 (productos y blog usan su portada).
- Dominio `windytech.studio`.
- Sin textos de eBay ni datos internos.

---

## 7. Feed RSS y automatización social

El feed está en:

```text
https://windytech.studio/blog/rss.xml
```

Incluye las publicaciones ordenadas por fecha, con portada, autor, etiquetas y enlace.

### 7.1 Opción recomendada: Buffer

1. Crea la cuenta y conecta Facebook, Instagram, LinkedIn, X y Telegram.
2. Añade el feed RSS del blog.
3. Buffer crea publicaciones en cola automáticamente.
4. Define horarios (por ejemplo, 10:00 y 18:00) y revisa la primera semana.

Ventaja: no hay que programar nada y permite editar cada publicación antes de que salga.

### 7.2 Opción Zapier

1. Crea un Zap.
2. Disparador: **RSS by Zapier → New Item in Feed** con la URL del feed.
3. Acción: **Facebook Pages → Create Page Post** (o LinkedIn, X, Telegram).
4. Mapea título, enlace y extracto.
5. Añade UTM al enlace: `?utm_source=facebook&utm_medium=social&utm_campaign=blog`.
6. Prueba con una publicación y activa el Zap.

### 7.3 Opción Make

1. Módulo **RSS → Watch RSS feed items**.
2. Módulo de red social (Facebook Pages, LinkedIn, X).
3. Mapea campos y programa la ejecución cada hora.

### 7.4 Opción IFTTT

1. Applet **RSS Feed → New feed item**.
2. Acción **Facebook Pages → Create a post**.
3. Es la opción más simple, pero con menos control del texto.

### 7.5 Reglas para no parecer spam

- Una publicación por artículo y red, no cinco seguidas.
- Cambia el texto según la red (LinkedIn más profesional, Instagram más visual).
- No publiques enlaces desnudos: añade contexto y una pregunta.
- Rota los formatos: enlace, carrusel, cita, vídeo corto.
- Instagram no permite autopublicar desde RSS en cuentas personales; usa una cuenta
  profesional y Buffer o Meta Business Suite.

### 7.6 Comprobar el feed

- Abre `https://windytech.studio/blog/rss.xml` y confirma que aparece el último artículo.
- Valida el XML en <https://validator.w3.org/feed/>.
- La caché es de 5 minutos; si acabas de publicar, espera un poco.

---

## 8. Datos estructurados y resultados enriquecidos

| Herramienta | Uso |
|---|---|
| <https://search.google.com/test/rich-results> | Producto, breadcrumbs, artículos, FAQ |
| <https://validator.schema.org/> | Validación completa del JSON-LD |
| <https://pagespeed.web.dev/> | Rendimiento y Core Web Vitals |

Qué revisar:

- **Producto**: precio, moneda, disponibilidad, SKU y marca. Debe salir sin errores.
- **Breadcrumb**: ruta Inicio → Catálogo → Producto.
- **Article/BlogPosting**: titular, autor, fecha y portada.
- **Organization**: nombre, logo, teléfono, correo y `sameAs`.
- **FAQ**: válido, aunque Google ya no muestra FAQ enriquecido en todos los sitios.

Si un producto no muestra resultado enriquecido, revisa precio, disponibilidad y que la
página no sea un borrador (`is_active = false`).

---

## 9. Sitemap, robots y errores

### 9.1 Sitemap

- Se genera en cada build con `scripts/generate-sitemap.ts`.
- Incluye páginas fijas, servicios, ciudades, productos, blog y proyectos.
- Incluye imágenes (`image:image`) de productos, publicaciones y proyectos.
- Valida el XML en <https://www.xml-sitemaps.com/validate-xml-sitemap.html>.

No falsees `lastmod`: se calcula con la fecha real de la base o del último commit.

### 9.2 `robots.txt`

Está en `public/robots.txt` y permite buscadores y asistentes de IA. Para probarlo:

1. Search Console → **Configuración → robots.txt**.
2. Comprueba que no bloquea `/catalogo/`, `/blog/`, `/servicios/` ni las imágenes.

### 9.3 404 reales

Las rutas inexistentes de catálogo, blog, servicios, seguimiento y ciudades ya devuelven
**404** (no redirección). Si Search Console marca “Soft 404”, revisa que la página no esté
vacía y que el estado sea 404.

---

## 10. Analítica y medición

### 10.1 Elegir proveedor

| Proveedor | Ventaja | Cuándo usarlo |
|---|---|---|
| Plausible | Sin cookies, simple, rápido | Recomendado si no quieres banner de cookies |
| Umami | Open source, sin cookies | Si prefieres autohospedarlo |
| GA4 | Gratis y muy completo | Si necesitas integración con Google Ads |

### 10.2 Instalación

El script debe ir en el `<head>` de `src/layouts/BaseLayout.astro`. Usa una variable de
entorno pública (`PUBLIC_*`) para no repetir el ID en el código.

Para GA4:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments)}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX');
</script>
```

Si usas GA4 y recibes tráfico de la Unión Europea, añade un banner de consentimiento antes
de cargar el script.

### 10.3 Conversiones que importan

| Evento | Dónde ocurre | Cómo medirlo |
|---|---|---|
| Clic en WhatsApp | Botón flotante y CTAs | `data-track="whatsapp"` |
| Formulario de contacto | `/contacto` | Envío correcto |
| Cotización creada | `POST /api/quotes` | WQ-2026-XXXX |
| Orden de compra | `purchase_orders` | WO-2026-XXXX |
| Suscripción RSS | `/blog/rss.xml` | Peticiones al feed |

### 10.4 UTM

Usa siempre el mismo formato:

```text
?utm_source=instagram&utm_medium=social&utm_campaign=post-portatiles
```

- `utm_source`: instagram, facebook, linkedin, x, telegram, email.
- `utm_medium`: social, email, cpc, referral.
- `utm_campaign`: nombre corto del contenido, sin espacios.

Los botones de compartir del sitio ya añaden UTM automáticamente.

---

## 11. Contenido, Discover y redes

### 11.1 Publicar en el blog

1. Portada de 1200×630 px (mínimo 1200 px de ancho).
2. Título claro con la palabra clave principal.
3. Un solo H1 y subtítulos H2/H3.
4. 800–1500 palabras, con ejemplos y datos.
5. Enlaces internos a servicios, catálogo y otros artículos.
6. Etiquetas: se convierten en hashtags al compartir.
7. Publica y comparte el mismo día.

### 11.2 Google Discover

- Imágenes grandes (1200 px o más) y de buena calidad.
- Títulos atractivos sin exagerar ni hacer clickbait.
- Contenido fresco y con autoría clara.
- Páginas rápidas y sin anuncios invasivos.

### 11.3 Reutilizar cada artículo

- LinkedIn: artículo o post con enlace.
- Instagram: carrusel con 3–5 ideas y enlace en la biografía.
- X: hilo corto con la idea principal.
- Telegram/WhatsApp: mensaje breve con el enlace.
- Vídeo corto: explica una sola idea del artículo.

---

## 12. Rutina de trabajo

### Cada semana

- Revisar mensajes y errores en Search Console.
- Publicar al menos un artículo o actualizar uno existente.
- Compartirlo en las redes con UTM.
- Revisar las cotizaciones y órdenes nuevas.
- Responder reseñas de Google.

### Cada mes

- Revisar Rendimiento: consultas, impresiones, CTR y posición media.
- Mejorar los títulos con CTR bajo.
- Actualizar 1–2 artículos antiguos.
- Revisar Core Web Vitals.
- Comprobar enlaces internos roto y páginas 404.
- Ejecutar `npm run seo:check -- --site=https://windytech.studio`.

### Cada trimestre

- Auditar el contenido: fusionar, actualizar o eliminar lo que no aporte.
- Revisar fichas locales y consistencia NAP.
- Buscar backlinks y colaboraciones.
- Validar datos estructurados de las páginas principales.
- Renovar las vistas previas sociales de las páginas top.

---

## 13. Problemas frecuentes

| Problema | Causa probable | Solución |
|---|---|---|
| Una página no aparece en Google | No rastreada, `noindex`, canonical o pocos enlaces | Inspeccionar URL, pedir indexación y enlazarla internamente |
| “Soft 404” | Página vacía o redirección | Verificar estado 404 real y contenido |
| La vista previa social está vieja | Caché de la red | Pasar el debugger y volver a rastrear |
| El sitemap no muestra cambios | No se ha desplegado o hay caché | Revisar `/sitemap.xml`, reenviar y esperar |
| Un producto no tiene resultado enriquecido | Falta precio, disponibilidad o SKU | Validar en Rich Results Test |
| El feed RSS no se actualiza | Caché de 5 minutos o artículo no publicado | Esperar, validar el XML y refrescar el agregador |
| IndexNow responde 403 | Clave o host incorrectos | Revisar el archivo de clave y el host |
| `sameAs` vacío | Perfiles sin URL | Rellenar `PROFILES` en `src/data/empresa.ts` |
| La analítica no registra | Script bloqueado o sin consentimiento | Revisar consola y el orden de carga |

---

## 14. Índice de herramientas

| Herramienta | Para qué | Enlace |
|---|---|---|
| Google Search Console | Indexación, rendimiento, sitemap | <https://search.google.com/search-console> |
| Bing Webmaster Tools | Indexación en Bing/DuckDuckGo | <https://www.bing.com/webmasters> |
| IndexNow | Avisar cambios a Bing y otros | <https://www.indexnow.org/> |
| Google Business Profile | Ficha local | <https://business.google.com/> |
| Bing Places | Ficha local en Bing | <https://www.bingplaces.com/> |
| Apple Business Connect | Ficha local en Apple | <https://businessconnect.apple.com/> |
| Rich Results Test | Resultados enriquecidos | <https://search.google.com/test/rich-results> |
| Schema Markup Validator | Validar JSON-LD | <https://validator.schema.org/> |
| PageSpeed Insights | Rendimiento y Core Web Vitals | <https://pagespeed.web.dev/> |
| Facebook Sharing Debugger | Vista previa en Facebook | <https://developers.facebook.com/tools/debug/> |
| LinkedIn Post Inspector | Vista previa en LinkedIn | <https://www.linkedin.com/post-inspector/> |
| Telegram Webpage Bot | Vista previa en Telegram | <https://t.me/WebpageBot> |
| W3C Feed Validator | Validar el RSS | <https://validator.w3.org/feed/> |
| Validador de sitemap | Validar el XML | <https://www.xml-sitemaps.com/validate-xml-sitemap.html> |
| Plausible | Analítica sin cookies | <https://plausible.io/> |
| Umami | Analítica open source | <https://umami.is/> |
| GA4 | Analítica de Google | <https://analytics.google.com/> |
| Buffer | Programar y automatizar redes | <https://buffer.com/> |
| Zapier | Automatizaciones | <https://zapier.com/> |
| Make | Automatizaciones | <https://www.make.com/> |
| IFTTT | Automatizaciones simples | <https://ifttt.com/> |

---

## 15. Registro de tareas manuales

Copia esta tabla en una nota o en una hoja de cálculo y actualízala:

| Fecha | Tarea | Herramienta | Resultado | Notas |
|---|---|---|---|---|
| | Sitemap enviado | Search Console | | |
| | Sitemap enviado | Bing Webmaster | | |
| | IndexNow ejecutado | Terminal | | |
| | Ficha Google creada | Google Business | | |
| | Ficha Bing creada | Bing Places | | |
| | Perfiles sociales añadidos | `empresa.ts` | | |
| | Feed conectado | Buffer/Zapier | | |
| | Analítica instalada | Plausible/GA4 | | |
| | Vistas previas revisadas | Debuggers | | |

---

## 16. Lo que no debes hacer

- Comprar enlaces o seguidores.
- Repetir palabras clave hasta hacer el texto ilegible.
- Publicar reseñas falsas.
- Copiar contenido de otros sitios.
- Generar decenas de páginas vacías para “posicionar”.
- Falsear fechas de modificación en el sitemap.
- Bloquear en `robots.txt` páginas que quieres indexar.
- Cambiar URLs sin redirección 301.

El SEO sostenible se basa en contenido útil, páginas rápidas, enlaces reales y una marca
consistente. Todo lo demás acelera o retrasa ese trabajo, pero no lo sustituye.

# SEO, GEO y presencia en buscadores — Windy Tech

Guía de lo que ya está implementado en el sitio y de los pasos que dependen de cuentas
externas (Google, Bing, Brave, redes sociales). El código no puede crear por sí solo un
panel de empresa: los buscadores lo construyen cuando verifican la entidad.

---

## 1. Lo que ya hace el sitio

### Icono en los resultados de búsqueda

- `public/favicon.ico` con tamaños 16, 32, 48, 64, 128 y 256 px.
- `public/assets/favicon-48.png`, `favicon-96.png`, `favicon-192.png` y `favicon-512.png`.
- `apple-touch-icon.png` de 180 px y `site.webmanifest` con iconos 192/512 y `maskable`.
- El favicon muestra el isotipo turquesa sobre un fondo circular azul marino.
- Etiquetas `<link rel="icon">` y `msapplication-TileImage` en `BaseLayout.astro`.
- `robots.txt` permite explícitamente a Googlebot, Bingbot, Bravebot, DuckDuckBot,
  Applebot, YandexBot y a los rastreadores de IA.

Google pide un favicon estable, cuadrado y de **al menos 48×48 px** en una URL que no
cambie. Se actualiza solo tras volver a rastrear el sitio (días o semanas).

### Vista previa al compartir

- Open Graph completo: `og:title`, `og:description`, `og:url`, `og:image`,
  `og:image:secure_url`, `og:image:type`, `og:image:width` (1200), `og:image:height` (630),
  `og:image:alt`, `og:locale` y `og:locale:alternate`.
- Twitter/X con `summary_large_image`.
- Imágenes `og.png` (español) y `og-en.png` (inglés) de 1200×630 px y menos de 300 KB.
- URLs absolutas con el dominio canónico `https://www.windytech.studio`.

### Entidad de empresa ("Acerca de")

- Nueva página `/nosotros/` y su versión inglesa `/en/about/`.
- Sección "Acerca de Windy Tech" en la portada, enlazada desde el pie de página.
- Datos estructurados JSON-LD:
  - `Organization` + `ProfessionalService` con nombre, actividad, fundación, correo,
    teléfono, país, cobertura, idiomas, medios de pago y catálogo de servicios.
  - `WebSite`, `WebPage` / `AboutPage`, `BreadcrumbList` y `FAQPage`.
  - Preguntas de entidad: "¿Qué es Windy Tech?", "¿Dónde está ubicada?".
- `public/llms.txt` ampliado con perfil, servicios, proceso, preguntas frecuentes y
  contacto para motores generativos (ChatGPT, Gemini, Perplexity, Copilot...).
- `sameAs` preparado en `src/data/site.ts` para enlazar redes y perfiles oficiales.

### Indexación

- `sitemap.xml` con las 8 URLs y etiquetas `hreflang` español/inglés.
- `robots.txt` con el sitemap declarado.
- `canonical` y `hreflang` en todas las páginas.
- `Content-Type` correcto para XML, texto e imágenes.
- Soporte para códigos de verificación de Google, Bing y Yandex en `site.ts`.

---

## 2. Configuración pendiente en `src/data/site.ts`

```ts
sameAs: [
  'https://www.instagram.com/tu-cuenta/',
  'https://www.linkedin.com/company/tu-empresa/',
  'https://www.facebook.com/tu-pagina/',
  'https://g.page/tu-perfil-de-google',
],

verification: {
  google: 'CÓDIGO_DE_SEARCH_CONSOLE',
  bing: 'CÓDIGO_DE_BING_WEBMASTER',
  yandex: '',
},
```

- `sameAs`: enlaces **oficiales** que ya existan. No inventar perfiles.
- `verification`: el valor exacto que entrega cada consola. Si queda vacío, la etiqueta
  no se renderiza.
- `foundingDate`: hoy vale `2026`; ajústalo si la empresa existe desde antes.

Después de editar, ejecuta `npm run build` y vuelve a desplegar.

---

## 3. Pasos fuera del código (obligatorios)

### Google Search Console

1. Entra a <https://search.google.com/search-console>.
2. Añade la propiedad de **dominio** `windytech.studio` (verificación por DNS) o la
   propiedad de prefijo `https://www.windytech.studio/` (verificación por meta tag).
3. Si usas meta tag, pega el código en `site.verification.google`, despliega y verifica.
4. Envía `https://www.windytech.studio/sitemap.xml`.
5. Usa **Inspección de URLs** → *Solicitar indexación* en `/`, `/nosotros/` y `/en/`.

### Bing Webmaster Tools (alimenta Bing, Copilot, DuckDuckGo y Yahoo)

1. Entra a <https://www.bing.com/webmasters>.
2. Puedes **importar el sitio desde Google Search Console** o verificar con la etiqueta
   `msvalidate.01` (pega el código en `site.verification.bing`).
3. Envía el sitemap.
4. Revisa **Site Explorer** y **SEO Reports** tras la primera semana.

### IndexNow (Bing, Yandex, Seznam, Naver y Brave)

El sitio ya incluye la clave `3912b45e618c49a3694bc4c10ff020f4` y el archivo público
`/3912b45e618c49a3694bc4c10ff020f4.txt`. Después de cada despliegue:

```bash
npm run build
npm run indexnow
```

Esto avisa a los motores que las URLs cambiaron. No sustituye al sitemap; lo acelera.

### Brave Search

Brave usa su propio rastreador (`Bravebot`) y participa en IndexNow.

1. Confirma que `robots.txt` lo permite (ya está).
2. Envía la URL en <https://search.brave.com/submit-url>.
3. Ejecuta `npm run indexnow` tras cada cambio.

### Google Business Profile (clave para el panel "Acerca de")

1. Crea o reclama el perfil en <https://business.google.com>.
2. Categoría principal: **Software company** o **Computer support and services**.
3. Define el negocio como **área de servicio** (Venezuela) si no hay local público.
4. Añade descripción, teléfono, correo, sitio web, logo, fotos y horario.
5. Publica novedades y pide reseñas reales a clientes.
6. Copia la URL del perfil en `site.sameAs`.

Google usa este perfil, junto con el sitio y los perfiles sociales, para construir el
panel de empresa que aparece al buscar la marca.

### Bing Places

1. Entra a <https://www.bingplaces.com>.
2. Importa el perfil desde Google Business Profile o créalo manualmente.
3. Verifica y añade la URL a `site.sameAs`.

### Perfiles sociales oficiales

Crea o reclama, como mínimo:

- LinkedIn (página de empresa).
- Instagram.
- Facebook.

Añade los enlaces en `sameAs`. Un panel de conocimiento se apoya en fuentes externas
coherentes: mismo nombre, misma descripción, mismo dominio y mismo teléfono.

### Consistencia de la información (NAP)

Usa siempre estos datos:

- **Nombre:** Windy Tech
- **Web:** https://www.windytech.studio
- **WhatsApp:** +58 412-7723148
- **Correo:** windytechestudio@gmail.com
- **Cobertura:** servicios digitales en todo el mundo; redes y equipos en Venezuela.

---

## 4. Refrescar la vista previa al compartir

Los mensajeros guardan la imagen en caché. Después de desplegar:

- **Facebook / WhatsApp:** <https://developers.facebook.com/tools/debug/> → pega la URL
  → *Scrape Again*. WhatsApp suele tardar unas horas en actualizar.
- **LinkedIn:** <https://www.linkedin.com/post-inspector/> → pega la URL → *Inspect*.
- **Twitter/X:** <https://cards-dev.twitter.com/validator> (requiere sesión).
- **Telegram:** envía el enlace a *@WebpageBot*.

Si la imagen no cambia, agrega un parámetro temporal al compartir
(`?v=2`) y luego retíralo.

---

## 5. Qué esperar y qué no prometer

- **Indexación:** días. **Favicon:** días o semanas. **Vista previa:** horas.
- **Panel "Acerca de" / knowledge panel:** no se solicita ni se garantiza. Aparece cuando
  Google o Bing consideran que la entidad es relevante y está corroborada por varias
  fuentes. Con el perfil de empresa, redes coherentes, reseñas y tráfico de marca suele
  tardar **semanas o meses**.
- El sitio nuevo (indexado hace horas) todavía no tiene historial. La autoridad se
  construye con contenido, enlaces y menciones reales, no solo con etiquetas.

---

## 6. Checklist después de desplegar

- [ ] `https://www.windytech.studio/favicon.ico` responde 200.
- [ ] `https://www.windytech.studio/assets/og.png` responde 200 y mide 1200×630.
- [ ] `https://www.windytech.studio/sitemap.xml` incluye `/nosotros/` y `/en/about/`.
- [ ] `https://www.windytech.studio/robots.txt` permite Bingbot y Bravebot.
- [ ] `https://www.windytech.studio/3912b45e618c49a3694bc4c10ff020f4.txt` devuelve la clave.
- [ ] Search Console y Bing Webmaster verificados y sitemap enviado.
- [ ] `npm run indexnow` ejecutado sin errores.
- [ ] Perfil de Google Business y Bing Places creados.
- [ ] `sameAs` completado con los perfiles oficiales.
- [ ] Vista previa probada en WhatsApp, LinkedIn y Facebook.

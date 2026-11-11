# Manual de Google Search Console — Windytech

Guía práctica para verificar, indexar y medir el sitio. Está adaptada a Windytech: Astro, deploy en Vercel, dominio canónico `windytech.studio`, contenido bilingüe y 22 URLs en el sitemap.

---

## 0. Datos del proyecto

| Dato | Valor |
|---|---|
| Nombre de la empresa | Windytech |
| Propiedad recomendada | Dominio: `windytech.studio` (incluye `www`, apex, http y https) |
| URL canónica | `https://windytech.studio/` |
| Apex | `https://windytech.studio/` → 308 a `www` |
| Sitemap | `https://windytech.studio/sitemap.xml` |
| Códigos de verificación | `src/data/site.ts` → `site.verification` |
| Script IndexNow | `npm run indexnow` |
| Guía SEO/GEO | `SEO-GEO.md` |
| Panel | https://search.google.com/search-console |

Páginas incluidas en el sitemap (se genera en cada build, hoy 22 URLs):

```
/                          /en/
/servicios/                /en/services/
/servicios/desarrollo-de-software/                    /en/services/custom-software-development/
/servicios/automatizacion-whatsapp/                   /en/services/whatsapp-automation/
/servicios/paginas-web/                               /en/services/web-design/
/servicios/marketing-seo/                             /en/services/seo-marketing/
/servicios/redes-e-infraestructura/                   /en/services/networks-infrastructure/
/servicios/equipos-informaticos/                      /en/services/it-equipment/
/nosotros/                 /en/about/
/legal/privacidad/         /legal/terminos/
/en/legal/privacy/         /en/legal/terms/
```

---

## 1. Qué es y qué no es Search Console

**Sí sirve para:**

- Confirmar que Google puede rastrear e indexar el sitio.
- Ver qué consultas muestran las páginas y con qué CTR.
- Detectar errores de indexación, canonical, robots, 404 y 5xx.
- Revisar Core Web Vitals, HTTPS, datos estructurados y enlaces entrantes.
- Recibir alertas de acciones manuales o problemas de seguridad.
- Pedir la indexación de una URL nueva o modificada.

**No sirve para:**

- Ver la posición exacta de una palabra clave en tiempo real.
- Garantizar indexación ni posiciones.
- Sustituir un plan de contenidos, enlaces o reputación de marca.
- Gestionar el favicon ni el panel de empresa (eso depende del rastreo y de Google Business Profile).

Search Console muestra datos, no milagros. La mayoría de los cambios tardan días o semanas en reflejarse.

---

## 2. Antes de empezar

1. Usa una cuenta de Google de la empresa, no una personal. Activa verificación en dos pasos.
2. Ten acceso al DNS del dominio o al código del sitio.
3. Decide una sola propiedad principal. Para este proyecto: **propiedad de dominio**.
4. No crees propiedades duplicadas para `www` y sin `www`: la propiedad de dominio ya cubre ambas.

### Permisos

En **Configuración → Usuarios y permisos**:

| Rol | Uso |
|---|---|
| Propietario | Cuenta principal de la empresa. No debe ser la del desarrollador. |
| Completo | Desarrollador o agencia: puede ver todo y usar herramientas. |
| Restringido | Solo lectura de informes. |

Añade al desarrollador como **Completo**, no como propietario.

---

## 3. Alta de la propiedad y verificación

### 3.1. Propiedad de dominio (recomendada)

1. Entra en https://search.google.com/search-console.
2. **Añadir propiedad → Dominio**.
3. Escribe `windytech.studio` (sin `https://`, sin `www`, sin barra final).
4. Google muestra un registro TXT: `google-site-verification=...`.
5. Añádelo en el proveedor de DNS:
   - **Si el DNS está en Vercel:** panel de Vercel → dominio `windytech.studio` → DNS Records → Add → Type `TXT`, Name `@`, Value `google-site-verification=...`, TTL automático.
   - **Si el DNS está en el registrador o Cloudflare:** mismo registro en la zona DNS.
6. Espera la propagación (de minutos a un par de horas).
7. Pulsa **Verificar**.

Ventajas: cubre `http`, `https`, `www`, apex y subdominios. **No borres el registro TXT**: si desaparece, pierdes la propiedad.

### 3.2. Propiedad de prefijo de URL con etiqueta meta (alternativa)

Úsala solo si no tienes acceso al DNS.

1. **Añadir propiedad → Prefijo de URL** → `https://windytech.studio/`.
2. Elige **Etiqueta HTML**.
3. Google da algo como:

   ```html
   <meta name="google-site-verification" content="ABC123..." />
   ```

4. Copia **solo el valor** de `content` (sin la etiqueta).
5. Pégalo en `src/data/site.ts`:

   ```ts
   verification: {
     google: 'ABC123...',
     bing: '',
     yandex: '',
   },
   ```

6. Compila, sube y espera el deploy:

   ```bash
   npm run build
   git add src/data/site.ts
   git commit -m "Add Google site verification"
   git push origin main
   ```

7. Comprueba que la etiqueta está publicada:

   ```bash
   curl -s https://windytech.studio/ | grep google-site-verification
   ```

8. Vuelve a Search Console y pulsa **Verificar**.

No pegues la etiqueta completa dentro del valor: el campo espera solo el token. Mantén la etiqueta publicada de forma permanente.

### 3.3. Qué propiedad usar

| Situación | Propiedad |
|---|---|
| Tienes acceso al DNS | Dominio `windytech.studio` |
| No tienes DNS, pero sí el código | Prefijo `https://windytech.studio/` |

No necesitas las dos. Si creas la de dominio, la meta de Google no hace falta.

---

## 4. Primeros 30 minutos (checklist)

- [ ] Propiedad verificada.
- [ ] **Sitemaps → Añadir sitemap** → `sitemap.xml` → Enviar.
- [ ] Confirmar estado **Correcto** y que descubre las 22 URLs.
- [ ] **Inspección de URL** en `/`, `/nosotros/`, `/en/`, `/en/about/` → *Probar URL publicada* → *Solicitar indexación*.
- [ ] Revisar **Indexación de páginas**: sin errores nuevos.
- [ ] Revisar **Seguridad** y **Acciones manuales**: deben estar limpias.
- [ ] Revisar **HTTPS**: correcto.
- [ ] Comprobar `robots.txt` en el navegador: permite `Googlebot` y no bloquea `/assets/` ni `/_astro/`.
- [ ] Activar/al revisar alertas por correo de la cuenta.

La cuota de *Solicitar indexación* es limitada (unas pocas URLs al día). Úsala solo en páginas nuevas o con cambios importantes, no en las 8 cada día.

---

## 5. Los informes, uno por uno

### 5.1. Rendimiento (Performance)

Muestra clics, impresiones, CTR y posición media de los últimos 16 meses. Los datos tienen 2–3 días de retraso.

**Pestañas:**

- **Consultas:** qué busca la gente antes de ver el sitio.
- **Páginas:** qué URL recibe las impresiones.
- **Países / Dispositivos / Apariencia en búsqueda / Fechas.**

**Cómo leerlo:**

| Métrica | Qué significa |
|---|---|
| Clics | Visitas desde resultados de Google. |
| Impresiones | Veces que apareció un enlace, aunque no se hiciera clic. |
| CTR | Clics ÷ impresiones. Depende de posición, título y marca. |
| Posición media | Promedio; una sola consulta en posición 1 y otra en 30 dan 15,5. Engaña. |

**Rutina útil:**

1. Filtra por consultas que contengan `windytech` para medir marca.
2. Filtra por consultas con `whatsapp`, `software`, `página web`, `venezuela`.
3. Ordena por impresiones y CTR bajo: son oportunidades de mejorar título y meta description.
4. Compara periodos (semana actual vs. anterior, mes vs. mes).
5. Exporta a CSV o usa la API para conservar histórico más allá de 16 meses.

**Realidad:** un sitio nuevo puede tardar semanas en tener impresiones. Que el informe esté vacío no significa que algo esté roto.

Nota: las consultas muy raras se omiten por privacidad. La suma de consultas no siempre cuadra con el total.

### 5.2. Indexación de páginas

Aquí ves qué URLs están indexadas y por qué otras no.

| Estado | Significado | Acción |
|---|---|---|
| Página indexada | Está en el índice. | Nada. |
| Página descubierta: actualmente sin indexar | Google conoce la URL pero aún no la ha rastreado. | Enlázala desde páginas importantes, revisa sitemap y espera. |
| Rastreada: actualmente sin indexar | La rastreó pero decidió no indexarla. | Mejora contenido, diferenciación y enlaces internos; espera. |
| Página alternativa con etiqueta canónica correcta | Es una variante (por ejemplo, con parámetros) y apunta a la principal. | Normal si es intencional. |
| Duplicada: Google eligió otra canónica | Google prefiere otra URL. | Revisa `canonical`, enlaces internos y hreflang. |
| Duplicada: sin canónica elegida por el usuario | Falta una canónica explícita. | Añade `canonical` autorreferente. |
| Excluida por etiqueta noindex | Tiene `noindex`. | Quita la etiqueta si debe indexarse. |
| Bloqueada por robots.txt | El rastreo está prohibido. | Corrige `robots.txt`; no bloquees CSS, JS ni imágenes. |
| Redirigida | 301/308. | Normal si es intencional y apunta a la URL correcta. |
| Error 404 / 410 | No existe. | Restaura, redirige o elimina enlaces internos. |
| Error de servidor 5xx | Fallo del hosting. | Revisa Vercel/logs y vuelve a probar. |
| Soft 404 | Página vacía o sin valor. | Mejora el contenido o devuelve un 404 real. |

**Sobre las páginas legales:** es normal que `/legal/*` queden como *Rastreada: actualmente sin indexar* si Google las considera de poco valor. No es un error. Mantenlas accesibles y sin `noindex`; aportan confianza y cumplimiento.

**Sobre las páginas en inglés:** `/en/` y `/en/about/` tienen contenido propio y canonical autorreferente. Deben indexarse por separado. Si no ocurre, revisa enlaces internos desde la versión española y la reciprocidad de hreflang.

**Validar correcciones:** el botón *Validar corrección* solo aplica a errores corregidos (5xx, 404, noindex, robots). No lo uses para *sin indexar*: no acelera nada.

### 5.3. Sitemaps

1. **Sitemaps → Añadir sitemap**.
2. Escribe `sitemap.xml` (la URL completa sería `https://windytech.studio/sitemap.xml`).
3. Enviar.

Qué revisar:

- **Estado:** *Correcto*.
- **Última lectura:** se actualiza cuando Google vuelve a leerlo; puede tardar días tras el deploy.
- **Páginas descubiertas:** 8.
- **Errores:** 0.

Si aparece *No se pudo obtener*:

- Abre `https://windytech.studio/sitemap.xml` y confirma 200 y XML válido.
- Comprueba que `robots.txt` no lo bloquea.
- Reenvíalo; a veces es un fallo temporal de lectura.

El sitemap es una sugerencia, no una orden de indexación. No envíes URLs sueltas si ya están en el sitemap.

**`lastmod`:** el sitemap es estático en `public/sitemap.xml`. Cuando cambies una página de forma relevante, actualiza su `<lastmod>` y `site.contentUpdated` en `src/data/site.ts`. Si `lastmod` cambia sin cambios reales, Google aprende a ignorarlo.

**Hreflang:** el sitemap incluye alternates `es`, `en` y `x-default`. Search Console no tiene un informe dedicado de hreflang; valida con la prueba de URL y con un validador externo.

### 5.4. Experiencia → Core Web Vitals

Mide LCP, INP y CLS con datos de usuarios reales (CrUX).

| Métrica | Correcto | Necesita mejorar | Malo |
|---|---|---|---|
| LCP | ≤ 2,5 s | 2,5–4 s | > 4 s |
| INP | ≤ 200 ms | 200–500 ms | > 500 ms |
| CLS | ≤ 0,1 | 0,1–0,25 | > 0,25 |

- Un sitio nuevo o con poco tráfico puede mostrar **sin datos** durante semanas. Usa PageSpeed Insights mientras tanto.
- Revisa móvil y escritorio por separado.
- Tras corregir, *Validar corrección* tarda hasta 28 días en reflejar el cambio.
- En este proyecto los riesgos típicos son: imágenes del hero sin dimensiones, fuentes que provocan salto y widgets de terceros.

### 5.5. HTTPS

Debe estar correcto. Vercel gestiona el certificado. Si aparece un problema:

- Comprueba que `https://windytech.studio/` carga sin avisos.
- Busca contenido mixto (`http://` en imágenes, scripts o CSS).
- Revisa que el apex redirija a `www` por HTTPS.

### 5.6. Mejoras y resultados enriquecidos

Aquí aparecen datos estructurados elegibles: migas de pan, FAQ, etc.

- **BreadcrumbList:** puede mostrar migas en resultados. El sitio ya lo incluye en `/nosotros/` y `/en/about/`.
- **FAQPage:** desde 2023 Google limita los resultados enriquecidos de FAQ a sitios gubernamentales o de salud autorizados. Para una empresa normal, el schema es válido y ayuda a entender el contenido, pero **no esperes un desplegable de preguntas en Google**.
- **Organization / ProfessionalService / AboutPage / WebSite:** no generan un rich result visual. Sirven para que Google entienda la entidad. El panel “Acerca de” depende de Google Business Profile, `sameAs`, reseñas y coherencia externa.

Validadores:

- Rich Results Test: https://search.google.com/test/rich-results
- Schema Markup Validator: https://validator.schema.org/

No inventes reseñas, valoraciones ni datos de empresa. Es motivo de acción manual.

### 5.7. Enlaces

- **Sitios de origen:** quién enlaza al dominio.
- **Páginas más enlazadas:** qué URLs reciben enlaces.

Es una muestra, no un inventario completo. No uses *Disavow* salvo que tengas un problema real de enlaces spam o una acción manual. Para un negocio legítimo, casi nunca hace falta.

### 5.8. Seguridad y acciones manuales

Revisa una vez al mes. Deben estar limpias.

- **Problemas de seguridad:** hackeos, contenido engañoso, malware.
- **Acciones manuales:** penalizaciones por spam, contenido de bajo valor, enlaces pagados, etc.

Si aparece una acción manual: lee el motivo, corrige, documenta y envía reconsideración. No la ignores.

### 5.9. Estadísticas de rastreo

Últimos 90 días de rastreo:

- Peticiones por respuesta (200, 301, 404, 5xx).
- Peticiones por tipo de archivo.
- Peticiones por propósito (página, imagen, robots.txt).
- Tiempo de respuesta.

Útil para detectar: 5xx intermitentes, páginas que Google intenta rastrear y no existen, o bloqueos accidentales.

### 5.10. Eliminaciones

- **Ocultar temporalmente:** retira una URL de resultados unos 6 meses. Úsalo solo para contenido urgente o sensible.
- **Eliminación permanente:** requiere `noindex`, 404/410 o contraseña.

No uses esta herramienta para “limpiar” el índice por SEO. Si una página no debe existir, elimínala o redirígela.

### 5.11. Configuración

- **Usuarios y permisos:** revisa accesos cada trimestre.
- **Cambio de dirección:** solo si migras de dominio. No aplica aquí.
- **Asociaciones:** conecta GA4 y Google Ads si los usas.
- **Verificación:** mantén el TXT o la meta.

---

## 6. Rutina recomendada

### Después de cada deploy (5 minutos)

1. Abre las URLs cambiadas y confirma 200.
2. Actualiza `lastmod`/`contentUpdated` si el contenido cambió.
3. Ejecuta:

   ```bash
   npm run build
   npm run indexnow
   ```

4. En Search Console, inspecciona solo las páginas nuevas o modificadas y solicita indexación.
5. Comprueba que no se publicó un `noindex` accidental.
6. Revisa **Sitemaps**: última lectura actualizada.

### Semanal (15 minutos)

- [ ] Rendimiento: clics e impresiones vs. semana anterior.
- [ ] Consultas nuevas y CTR bajo en posiciones 4–15.
- [ ] Indexación de páginas: errores nuevos.
- [ ] Sitemaps: estado correcto.
- [ ] Seguridad y acciones manuales: sin cambios.

### Mensual (45 minutos)

- [ ] Core Web Vitals: móvil y escritorio.
- [ ] Páginas “sin indexar”: decidir si merecen contenido o enlaces.
- [ ] Consultas con impresiones y sin clics: reescribir títulos/descripciones.
- [ ] Revisar `/en/`: rendimiento y errores.
- [ ] Enlaces entrantes nuevos.
- [ ] Coherencia de marca: GBP, redes, teléfono, correo.
- [ ] Actualizar el sitemap si hay páginas nuevas.

### Trimestral

- [ ] Auditoría completa de indexación y canónicas.
- [ ] Revisar hreflang español/inglés.
- [ ] Actualizar contenidos antiguos.
- [ ] Revisar accesos de usuarios.
- [ ] Comparar objetivos y ajustar el plan de contenidos.

---

## 7. Playbooks para este sitio

### 7.1. Google muestra el globo en vez del favicon

No es un error de código. Google aún no ha procesado el favicon.

1. Confirma que `/favicon.ico` responde 200 y que los PNG son cuadrados.
2. No cambies el favicon durante varias semanas.
3. Solicita indexación de la home.
4. Monitoriza:

   ```bash
   curl -sSL -o /dev/null -w "%{http_code}\n" \
     "https://www.google.com/s2/favicons?domain=windytech.studio&sz=128"
   ```

   Mientras devuelva `404`, Google sigue mostrando el globo.

### 7.2. El sitio no aparece en Google

1. ¿La propiedad está verificada y el sitemap enviado?
2. **Inspección de URL** de la home: ¿dice “La URL está en Google”?
3. Revisa `noindex`, `canonical`, `robots.txt` y redirecciones.
4. Comprueba que hay enlaces internos y externos hacia la página.
5. Solicita indexación una vez y espera.

Un dominio nuevo puede tardar semanas. No hay atajo legítimo.

### 7.3. “Descubierta: actualmente sin indexar”

Es el estado normal de un sitio nuevo.

- Enlaza la página desde la home o desde otra página indexada.
- Mejora el contenido para que sea único y útil.
- Añade pruebas de confianza: `/nosotros/`, contacto, legales, dirección.
- Espera. Solicitar indexación repetidamente no cambia la decisión.

### 7.4. “Rastreada: actualmente sin indexar”

Google la vio y no la consideró suficiente.

- Pregúntate qué aporta frente a otras páginas del sitio.
- Evita páginas casi duplicadas ( español/inglés no deberían ser traducción automática vacía).
- Amplía contenido, ejemplos, precios, casos o preguntas reales.
- Gana enlaces internos y externos.

### 7.5. Las páginas en inglés no se indexan

- Cada versión debe tener `canonical` propia (no apuntar al español).
- hreflang recíproco: `es`, `en`, `x-default`.
- El selector de idioma debe ser un enlace rastreable (lo es).
- Enlaza `/en/` desde la home y desde el pie.
- Añade contenido específico, no solo traducción literal.

### 7.6. Canónica distinta a la que quiero

- Comprueba que cada página tiene `canonical` autorreferente.
- Revisa enlaces internos con parámetros (`?utm=...`).
- Asegura una sola versión (`www`) y redirecciones 308 del apex.
- No mezcles `http` y `https`.

### 7.7. El panel “Acerca de” o el logo de empresa no aparece

No se gestiona en Search Console.

1. Crea/reclama Google Business Profile.
2. Crea/reclama Bing Places.
3. Rellena `sameAs` en `src/data/site.ts` con Instagram, LinkedIn, Facebook y GBP.
4. Mantén nombre, dirección, teléfono y web idénticos en todos lados.
5. Consigue reseñas reales.
6. Espera semanas o meses.

### 7.8. Caída de tráfico

1. Revisa **Acciones manuales** y **Seguridad**.
2. Revisa **Indexación**: ¿desaparecieron páginas?
3. Comprueba errores 5xx y cambios de deploy.
4. Mira si hubo una actualización de algoritmo en esas fechas.
5. Compara estacionalidad y cambios de medición (GA4, consentimiento).
6. No cambies todo el sitio de golpe por un bache de dos días.

### 7.9. El sitemap “no se pudo obtener”

- Abre la URL en incógnito: debe devolver 200 y XML.
- Verifica que no haya `noindex` ni bloqueo en `robots.txt`.
- Reenvía el sitemap.
- Si el dominio acaba de cambiar, espera la propagación DNS.

---

## 8. Errores que debes evitar

- Pulsar *Solicitar indexación* todos los días en las mismas URLs.
- Cambiar favicon, título o canonical cada semana.
- Enviar el sitemap antes de que el deploy esté publicado.
- Usar *Eliminaciones* como herramienta SEO.
- Bloquear `/assets/`, `/_astro/` o las imágenes en `robots.txt`.
- Poner `noindex` en `/nosotros/` o en las legales “para limpiar”.
- Rellenar `sameAs` con perfiles que no existen.
- Comprar enlaces o inventar reseñas.
- Juzgar todo por la posición media.
- Esperar resultados en 48 horas.

---

## 9. Objetivos realistas

| Plazo | Qué esperar |
|---|---|
| Semanas 1–4 | Verificación, sitemap leído, primeras impresiones, favicon aún pendiente. |
| Meses 2–3 | Long tail con impresiones, CTR mejorable, páginas secundarias indexadas. |
| Meses 3–6 | Posiciones estables en marca y servicios locales; CWV con datos. |
| Meses 6–12 | Crecimiento sostenido si hay contenido, enlaces y reputación. |

Métricas a seguir:

- Páginas indexadas (objetivo: 8, salvo que Google decida excluir legales).
- Impresiones y clics mensuales.
- Consultas con impresión (amplitud del contenido).
- CTR en posiciones 4–10.
- Core Web Vitals en verde.
- Búsquedas de marca (`windytech`, `windy tech studio`).

---

## 10. Referencia rápida

| Recurso | URL |
|---|---|
| Search Console | https://search.google.com/search-console |
| Sitemap | https://windytech.studio/sitemap.xml |
| Rich Results Test | https://search.google.com/test/rich-results |
| Validador de schema | https://validator.schema.org/ |
| PageSpeed Insights | https://pagespeed.web.dev/ |
| Bing Webmaster Tools | https://www.bing.com/webmasters |
| Favicon cache de Google | https://www.google.com/s2/favicons?domain=windytech.studio&sz=128 |

Comandos del proyecto:

```bash
npm run build      # genera dist/
npm run check      # 0 errores esperados
npm run indexnow   # avisa a Bing, Brave, Yandex, Seznam y Naver
```

Rutas clave:

```
src/data/site.ts              verificación y sameAs
src/layouts/BaseLayout.astro  metadatos, schema, iconos
public/sitemap.xml            URLs y lastmod
public/robots.txt             directivas de rastreo
SEO-GEO.md                    estrategia SEO/GEO
```

---

## 11. Herramientas para SEO

No necesitas pagar para un sitio de 8 páginas. Este es el stack que recomiendo, en orden de utilidad real.

### 11.1. Stack gratuito (empieza aquí)

| Herramienta | Para qué sirve | Enlace |
|---|---|---|
| Google Search Console | Indexación, consultas, CTR, CWV, enlaces, errores | https://search.google.com/search-console |
| Google Analytics 4 | Tráfico, fuentes, conversiones y eventos | https://analytics.google.com |
| Bing Webmaster Tools | Bing y DuckDuckGo; importa el sitio desde GSC | https://www.bing.com/webmasters |
| Google Business Profile | Ficha local, reseñas y panel “Acerca de” | https://business.google.com |
| Bing Places | Ficha local en Bing Maps | https://www.bingplaces.com |
| Apple Business Connect | Ficha en Apple Maps | https://businessconnect.apple.com |
| Screaming Frog SEO Spider | Auditoría técnica; gratis hasta 500 URLs | https://www.screamingfrog.co.uk/seo-spider/ |
| PageSpeed Insights | Core Web Vitals con datos reales y laboratorio | https://pagespeed.web.dev |
| Lighthouse (Chrome DevTools) | Auditoría local de rendimiento, SEO y accesibilidad | Chrome → F12 → Lighthouse |
| Rich Results Test | Validar FAQ, breadcrumbs y otros datos estructurados | https://search.google.com/test/rich-results |
| Schema Markup Validator | Validar Organization, AboutPage, WebSite, etc. | https://validator.schema.org |
| Google Trends | Demanda, estacionalidad y comparación de términos | https://trends.google.com |
| Google Keyword Planner | Volumen de búsqueda por país (rangos) | https://ads.google.com/home/tools/keyword-planner/ |
| Ahrefs Webmaster Tools | Backlinks y salud técnica de tu propio dominio | https://ahrefs.com/webmaster-tools |
| Looker Studio | Dashboards de GSC + GA4 sin pagar | https://lookerstudio.google.com |
| Microsoft Clarity | Mapas de calor y grabaciones de sesión | https://clarity.microsoft.com |
| UptimeRobot | Alertas si el sitio se cae | https://uptimerobot.com |
| Squoosh / TinyPNG | Comprimir imágenes antes de subirlas | https://squoosh.app · https://tinypng.com |
| RealFaviconGenerator | Generar el set completo de favicons | https://realfavicongenerator.net |
| Wayback Machine | Ver versiones anteriores del sitio | https://web.archive.org |
| WAVE / axe DevTools | Accesibilidad (también ayuda al SEO) | https://wave.webaim.org · https://www.deque.com/axe/devtools/ |
| Metatags.io | Previsualizar título, descripción y Open Graph | https://metatags.io |
| Facebook Sharing Debugger | Refrescar la caché de vista previa | https://developers.facebook.com/tools/debug/ |
| LinkedIn Post Inspector | Refrescar la vista previa en LinkedIn | https://www.linkedin.com/post-inspector/ |
| Telegram WebpageBot | Refrescar la vista previa en Telegram | https://t.me/WebpageBot |
| SSL Labs | Revisar el certificado y la configuración TLS | https://www.ssllabs.com/ssltest/ |
| Security Headers | Revisar cabeceras de seguridad | https://securityheaders.com |

### 11.2. De pago, solo cuando haya contenido y tráfico

| Herramienta | Uso | Cuándo pagarla |
|---|---|---|
| Ahrefs | Keywords, backlinks, auditoría, competencia | Cuando publiques contenido de forma constante |
| Semrush | Suite completa: keywords, anuncios, rank tracking | Si necesitas todo en uno |
| SE Ranking / Mangools | Alternativa económica a Ahrefs/Semrush | Presupuesto ajustado |
| Screaming Frog (licencia) | Crawls ilimitados y programados | Si superas 500 URLs o auditas cada mes |
| Sitebulb | Auditoría técnica visual | Si haces auditorías para clientes |
| Wincher / AccuRanker | Seguimiento diario de posiciones | Cuando tengas 20+ keywords objetivo |
| Surfer / Clearscope / Frase | Optimización de contenido | Si publicas artículos largos |
| WebPageTest / DebugBear | Rendimiento avanzado | Si CWV no llega a verde |
| Moz Pro | Backlinks y autoridad | Si trabajas links de forma activa |

Para este proyecto, el stack gratuito es suficiente durante los primeros 3–6 meses. Pagar antes de tener contenido es gastar sin datos.

### 11.3. Qué herramienta usar para cada tarea

| Necesito… | Herramienta |
|---|---|
| Saber si Google indexó una página | Search Console → Inspección de URL |
| Ver consultas y CTR | Search Console → Rendimiento |
| Investigar keywords | Keyword Planner + Trends + AlsoAsked |
| Ver qué pregunta la gente | Google “Otras preguntas”, AlsoAsked, Reddit |
| Auditar enlaces rotos, títulos y canonicals | Screaming Frog |
| Medir velocidad | PageSpeed Insights + Lighthouse + WebPageTest |
| Validar schema | Rich Results Test + Schema Validator |
| Validar hreflang | Generador/validador de Aleyda Solis |
| Ver backlinks | GSC → Enlaces + Ahrefs Webmaster Tools |
| Gestionar la ficha local | Google Business Profile + Bing Places + Apple Business Connect |
| Monitorizar caídas | UptimeRobot |
| Ver mapas de calor | Microsoft Clarity |
| Refrescar previews sociales | Facebook Debugger, LinkedIn Inspector, Telegram Bot |
| Comprobar seguridad | SSL Labs + Security Headers |
| Mejorar accesibilidad | WAVE + axe DevTools |
| Automatizar avisos a buscadores | `npm run indexnow` |

### 11.4. Flujo mensual con estas herramientas

1. **Search Console:** Rendimiento + Indexación + Sitemaps.
2. **GA4:** sesiones, fuentes y conversiones (WhatsApp, formulario).
3. **Screaming Frog:** crawl de `https://windytech.studio` (22 URLs).
   - Revisa títulos duplicados, metas largas, 404, redirecciones y canonical.
4. **PageSpeed Insights:** `/`, `/nosotros/`, `/en/`.
5. **Rich Results Test:** home, `/nosotros/` y `/en/about/`.
6. **Ahrefs Webmaster Tools:** enlaces nuevos y errores técnicos.
7. **Clarity:** grabaciones de la home y de la página de contacto.
8. **Looker Studio:** un dashboard con GSC + GA4 para ver la evolución.
9. **UptimeRobot:** monitor de `https://windytech.studio/` cada 5 minutos.

### 11.5. Herramientas que ya están integradas en el proyecto

| Función | Dónde |
|---|---|
| Sitemap con hreflang | `public/sitemap.xml` |
| Robots para Google, Bing, Brave, IA | `public/robots.txt` |
| IndexNow (Bing, Brave, Yandex, Seznam, Naver) | `npm run indexnow` |
| Schema Organization + ProfessionalService + AboutPage + WebSite + Breadcrumb + FAQ | `src/layouts/BaseLayout.astro` |
| Open Graph y Twitter Cards | `src/layouts/BaseLayout.astro` |
| Favicons 16–512 px y manifest | `public/` |
| Verificación de buscadores | `src/data/site.ts` → `verification` |
| Perfil para asistentes de IA | `public/llms.txt` |

### 11.6. Qué evitar

- Herramientas que prometen “indexación instantánea” o “SEO garantizado”.
- Directorios masivos, PBN, enlaces comprados o intercambios automáticos.
- Generar 50 artículos con IA sin revisión humana: Google penaliza el contenido de bajo valor.
- Obsesionarse con el “SEO score” de Lighthouse: 100 no significa mejor posición.
- Rastrear posiciones a diario con 3 keywords: no aporta decisiones.
- Usar herramientas que incumplen los términos de servicio de Google (scrapers agresivos).
- Instalar 10 plugins o scripts de terceros que ralenticen el sitio.

---

## 12. Checklist imprimible

### Alta

- [ ] Propiedad de dominio verificada por DNS.
- [ ] TXT conservado.
- [ ] Usuario de la empresa como propietario.
- [ ] Desarrollador con permiso completo.
- [ ] Sitemap enviado y correcto.
- [ ] 4 páginas principales inspeccionadas.
- [ ] Sin acciones manuales ni problemas de seguridad.

### Cada deploy

- [ ] Build correcto.
- [ ] URLs cambiadas responden 200.
- [ ] `lastmod` actualizado.
- [ ] `npm run indexnow`.
- [ ] Indexación solicitada solo para lo nuevo.
- [ ] Sin `noindex` accidental.

### Cada semana

- [ ] Clics e impresiones.
- [ ] Consultas nuevas.
- [ ] CTR bajo en posiciones 4–15.
- [ ] Errores de indexación.
- [ ] Sitemap leído.

### Cada mes

- [ ] Core Web Vitals.
- [ ] Páginas sin indexar.
- [ ] Enlaces entrantes.
- [ ] Coherencia GBP/redes.
- [ ] Revisión de contenidos y títulos.

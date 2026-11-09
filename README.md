# Windytech — sitio web

Sitio bilingüe (español / inglés) para Windytech, construido con Astro y CSS propio.
La primera versión está enfocada en **servicios**: desarrollo de software, automatización,
webs, marketing, redes y equipos. El catálogo de equipos queda para una fase posterior.

## Requisitos

- Node.js 20.3 o superior
- npm 9.6 o superior

## Comandos

```bash
npm install
npm run dev       # servidor local en http://localhost:4321
npm run build     # genera dist/ y dist/sitemap.xml
npm run preview   # previsualiza dist/
npm run sitemap   # regenera dist/sitemap.xml sobre un build existente
npm run seo:check # valida canonical, hreflang, títulos, JSON-LD y enlaces
npm run indexnow  # avisa a Bing/Brave/Yandex de las URLs del sitemap
npm run check     # revisión de tipos y plantillas Astro
```

`npm run seo:check` revisa `dist/`. Para comprobar el sitio publicado:
`node scripts/check-seo.mjs --site=https://www.windytech.studio`.

## Estructura

```
src/
  components/     Header, Footer, Icon, ContactForm, HomePage, AboutPage, ServicePage, ServicesHub, LegalPage
  data/           site.ts (contenido bilingüe), services.ts, about.ts, legal.ts
  layouts/        BaseLayout.astro (SEO, iconos, Open Graph, schema)
  pages/          /, /en/, /servicios/*, /en/services/*, /nosotros/, /en/about/, /legal/*, /en/legal/*
  styles/         global.css
public/
  assets/         logos WebP/PNG, fuentes WOFF2, favicons 48–512, imagen Open Graph
  robots.txt
  llms.txt        resumen de empresa y servicios para sistemas de IA
  llms-full.txt   perfil completo para sistemas de IA
  site.webmanifest
  <clave>.txt     verificación de IndexNow
scripts/
  generate-sitemap.mjs  genera dist/sitemap.xml desde el HTML construido
  check-seo.mjs         comprobaciones SEO sobre dist o el sitio live
  indexnow.mjs          aviso de cambios a Bing, Brave, Yandex y otros
vercel.json       cabeceras de seguridad y caché (Vercel)
.github/workflows/seo.yml  CI de check, build y seo:check
SEO-GEO.md        guía de SEO, GEO y presencia en buscadores
```

## Dónde editar

- **Textos, precios, servicios y campañas:** `src/data/site.ts`
- **Páginas de servicio (ES/EN):** `src/data/services.ts`
- **Política de privacidad y términos:** `src/data/legal.ts`
- **WhatsApp, correo y dominio:** `src/data/site.ts`
- **Colores, tipografías y estilos:** `src/styles/global.css`

El formulario de contacto no necesita backend: arma un mensaje y abre WhatsApp con los
datos del visitante. Si más adelante quieres correo automático o CRM, se puede conectar
Web3Forms, Resend o un endpoint propio.

## Rutas

- `/` — español
- `/en/` — inglés
- `/servicios/` — hub de servicios (español)
- `/servicios/desarrollo-de-software/`, `/servicios/automatizacion-whatsapp/`,
  `/servicios/paginas-web/`, `/servicios/marketing-seo/`,
  `/servicios/redes-e-infraestructura/`, `/servicios/equipos-informaticos/`
- `/en/services/` — services hub (English), con sus 6 páginas equivalentes
- `/nosotros/` — acerca de la empresa (español)
- `/en/about/` — acerca de la empresa (inglés)
- `/legal/privacidad/` y `/legal/terminos/`
- `/en/legal/privacy/` y `/en/legal/terms/`

## Deploy (Vercel)

1. Sube el proyecto a GitHub.
2. Importa el repositorio en Vercel.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Configura `www.windytech.studio` como dominio canónico (el apex redirige con 308).
6. Añade el dominio a Google Search Console y Bing Webmaster Tools y envía `/sitemap.xml`.

`vercel.json` aplica cabeceras de seguridad y caché; `public/_headers` solo sirve en
Netlify/Cloudflare y Vercel lo ignora. El sitemap se genera en cada build.

El sitio incluye metadatos estructurados bilingües, páginas de servicio, una página
`/nosotros/`, preguntas frecuentes visibles, iconos para resultados de búsqueda, Open Graph
para vistas previas, directivas para rastreadores y `llms.txt` + `llms-full.txt`. Estas
mejoras ayudan a interpretar el contenido y a construir la entidad de la empresa, pero no
garantizan posiciones ni un panel de conocimiento automático. La guía completa está en
[`SEO-GEO.md`](SEO-GEO.md).
La portada también incluye enlaces de compartir en WhatsApp, Facebook y LinkedIn, más una
acción para copiar el enlace; son enlaces directos y no cargan widgets externos de seguimiento.

## Pendientes antes de publicar

- [ ] Revisar el número de WhatsApp y el correo en `src/data/site.ts`.
- [ ] Revisar los textos legales con un abogado/contador.
- [ ] Confirmar que el dominio `www.windytech.studio` apunta al deploy.
- [ ] Configurar correo profesional (`hola@windytech.studio`) y redirigirlo si hace falta.
- [ ] Añadir analítica (GA4 o Plausible) cuando exista una cuenta.
- [ ] Verificar el sitio en Google Search Console y Bing Webmaster Tools y pegar los códigos en `site.verification`.
- [ ] Enviar el sitemap y ejecutar `npm run indexnow` después de cada despliegue.
- [ ] Crear Google Business Profile y Bing Places, y añadir sus URLs a `site.sameAs`.
- [ ] Crear/reclamar Instagram, LinkedIn y Facebook, y añadirlos a `site.sameAs`.
- [ ] Revisar `foundingDate` en `site.ts` si la empresa existe desde antes de 2026.
- [ ] Reemplazar la página de equipos por el catálogo cuando haya precios, stock y garantía.

## Catálogo de equipos (fase posterior)

Cuando el catálogo esté listo, se puede agregar:

- `src/data/catalog.ts` con SKUs, categorías, condición, precio y stock.
- `/catalogo/` y `/en/catalog/` con filtros.
- Ficha por producto con botón de WhatsApp y mensaje precargado.
- Administración por JSON o CMS ligero (Sanity/Decap).

No se recomienda publicar precios o plazos de equipos hasta confirmar proveedor, margen,
garantía y logística.

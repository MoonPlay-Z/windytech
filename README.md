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
npm run build     # compila el servidor SSR en dist/
npm run preview   # previsualiza el build
npm run check     # revisión de tipos y plantillas Astro
npm test          # pruebas unitarias (node:test + tsx)
npm run sitemap   # genera dist/sitemap.xml sobre un build estático
npm run seo:check # valida canonical, hreflang, títulos, JSON-LD y enlaces
npm run indexnow  # avisa a Bing/Brave/Yandex de las URLs del sitemap
npm run db:push   # sincroniza el esquema Drizzle con la base de datos
npm run db:studio # abre Drizzle Studio
```

`npm run seo:check` necesita HTML estático en `dist/` o el sitio publicado:
`node scripts/check-seo.mjs --site=https://www.windytech.studio`. Como el sitio se
sirve con SSR (`@astrojs/node`), el build de producción no genera HTML estático y el
chequeo automático se hace contra el sitio desplegado, no en el CI.

## Estructura

```
src/
  components/     Header, Footer, Icon, ContactForm, HomePage, AboutPage, ServicePage, admin/*
  data/           site.ts (contenido bilingüe), services.ts, about.ts, legal.ts
  layouts/        BaseLayout.astro (SEO, iconos, Open Graph, schema)
  lib/            API, auth, base de datos Drizzle, catálogo, precios, seguridad
  pages/          marketing (/, /servicios/*, /nosotros/…), /cuenta/*, /admin/*, /api/*
  scripts/        JS de cliente (panel, cuenta, carrito)
  styles/         global.css, account.css, admin.css
  middleware.ts   cabeceras de seguridad y caché
drizzle/          SQL histórico de referencia (el esquema se sincroniza con db:push)
public/
  assets/         logos WebP/PNG, fuentes WOFF2, favicons 48–512, imagen Open Graph
  robots.txt
  llms.txt        resumen de empresa y servicios para sistemas de IA
  llms-full.txt   perfil completo para sistemas de IA
  site.webmanifest
  <clave>.txt     verificación de IndexNow
scripts/
  bootstrap-admin.ts    crea el administrador inicial
  generate-sitemap.mjs  genera dist/sitemap.xml desde el HTML construido
  check-seo.mjs         comprobaciones SEO sobre dist o el sitio live
  indexnow.mjs          aviso de cambios a Bing, Brave, Yandex y otros
render.yaml       despliegue del servicio web Node en Render
.github/workflows/seo.yml  CI de check y build
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

## Base de datos

El esquema vive en `src/lib/db/schema.ts` y se sincroniza con:

```bash
npm run db:push
```

Los archivos de `drizzle/` son SQL histórico de referencia: se aplicaron antes de que
existiera un journal de migraciones. Por eso **no** se debe ejecutar
`drizzle-kit migrate` sobre la base actual (intentaría recrear tablas existentes).
Para un entorno nuevo, aplica el esquema con `db:push`; para generar SQL a partir de
cambios futuros, usa `npm run db:generate` después de crear un baseline.

El administrador inicial se crea una sola vez con:

```bash
npx tsx scripts/bootstrap-admin.ts
```

## Deploy (Render)

1. Sube el proyecto a GitHub.
2. Crea un **Web Service** en Render apuntando al repositorio (o importa `render.yaml`).
3. Build command: `npm ci && npm run build`
4. Start command: `node dist/server/entry.mjs`
5. Configura las variables de `.env.example` en el panel de Render. `DATABASE_URL`
   debe apuntar a la base PostgreSQL de Neon.
6. Añade `www.windytech.studio` como dominio canónico y verifica `/api/health`.
7. Ejecuta `npm run db:push` una vez contra la base y envía `/sitemap.xml` en Google
   Search Console y Bing Webmaster Tools.

Las cabeceras de seguridad y caché se aplican desde `src/middleware.ts`, así que no
dependen del proveedor de hosting. El sitemap estático se genera con `npm run sitemap`
sobre un build estático o se sirve desde el sitio publicado.

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

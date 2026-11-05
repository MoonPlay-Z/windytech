# Windy Tech — sitio web

Sitio bilingüe (español / inglés) para Windy Tech, construido con Astro y CSS propio.
La primera versión está enfocada en **servicios**: desarrollo de software, automatización,
webs, marketing, redes y equipos. El catálogo de equipos queda para una fase posterior.

## Requisitos

- Node.js 20.3 o superior
- npm 9.6 o superior

## Comandos

```bash
npm install
npm run dev       # servidor local en http://localhost:4321
npm run build     # genera dist/
npm run preview   # previsualiza dist/
npm run indexnow  # avisa a Bing/Brave/Yandex de las URLs del sitemap
npm run check     # revisión de tipos y plantillas Astro
```

## Estructura

```
src/
  components/     Header, Footer, Icon, ContactForm, HomePage, AboutPage, LegalPage
  data/           site.ts (contenido bilingüe), about.ts, legal.ts
  layouts/        BaseLayout.astro (SEO, iconos, Open Graph, schema)
  pages/          /, /en/, /nosotros/, /en/about/, /legal/*, /en/legal/*
  styles/         global.css
public/
  assets/         logos WebP/PNG, fuentes WOFF2, favicons 48–512, imagen Open Graph
  robots.txt
  llms.txt        perfil de empresa y servicios para sistemas de IA
  sitemap.xml
  site.webmanifest
  <clave>.txt     verificación de IndexNow
scripts/
  indexnow.mjs    aviso de cambios a Bing, Brave, Yandex y otros
SEO-GEO.md        guía de SEO, GEO y presencia en buscadores
```

## Dónde editar

- **Textos, precios, servicios y campañas:** `src/data/site.ts`
- **Política de privacidad y términos:** `src/data/legal.ts`
- **WhatsApp, correo y dominio:** `src/data/site.ts`
- **Colores, tipografías y estilos:** `src/styles/global.css`

El formulario de contacto no necesita backend: arma un mensaje y abre WhatsApp con los
datos del visitante. Si más adelante quieres correo automático o CRM, se puede conectar
Web3Forms, Resend o un endpoint propio.

## Rutas

- `/` — español
- `/en/` — inglés
- `/nosotros/` — acerca de la empresa (español)
- `/en/about/` — acerca de la empresa (inglés)
- `/legal/privacidad/` y `/legal/terminos/`
- `/en/legal/privacy/` y `/en/legal/terms/`

## Deploy recomendado (gratis)

1. Sube el proyecto a GitHub.
2. Crea un proyecto en Cloudflare Pages.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Conecta el dominio `www.windytech.studio` y configura DNS.
6. Añade el dominio a Google Search Console y envía `/sitemap.xml`.

El sitio incluye metadatos estructurados bilingües, una página `/nosotros/`, preguntas
frecuentes visibles, iconos para resultados de búsqueda, Open Graph para vistas previas,
directivas para rastreadores y `/llms.txt`. Estas mejoras ayudan a interpretar el contenido
y a construir la entidad de la empresa, pero no garantizan posiciones ni un panel de
conocimiento automático. La guía completa está en [`SEO-GEO.md`](SEO-GEO.md).
La portada también incluye enlaces de compartir en WhatsApp, Facebook y LinkedIn, más una
acción para copiar el enlace; son enlaces directos y no cargan widgets externos de seguimiento.

También funciona en Vercel o Netlify con la misma configuración.

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

## Fase 2: catálogo

Cuando el catálogo esté listo, se puede agregar:

- `src/data/catalog.ts` con SKUs, categorías, condición, precio y stock.
- `/catalogo/` y `/en/catalog/` con filtros.
- Ficha por producto con botón de WhatsApp y mensaje precargado.
- Administración por JSON o CMS ligero (Sanity/Decap).

No se recomienda publicar precios o plazos de equipos hasta confirmar proveedor, margen,
garantía y logística.

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
```

## Estructura

```
src/
  components/     Header, Footer, Icon, ContactForm, HomePage, LegalPage
  data/           site.ts (contenido bilingüe), legal.ts (privacidad y términos)
  layouts/        BaseLayout.astro (SEO, fuentes, schema)
  pages/          /, /en/, /legal/*, /en/legal/*
  styles/         global.css
public/
  assets/         logos, favicon, imagen Open Graph
  robots.txt
  llms.txt        resumen de servicios para sistemas de IA
  sitemap.xml
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
- `/legal/privacidad/` y `/legal/terminos/`
- `/en/legal/privacy/` y `/en/legal/terms/`

## Deploy recomendado (gratis)

1. Sube el proyecto a GitHub.
2. Crea un proyecto en Cloudflare Pages.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Conecta el dominio `windytech.studio` y configura DNS.
6. Añade el dominio a Google Search Console y envía `/sitemap.xml`.

El sitio incluye metadatos estructurados bilingües, preguntas frecuentes visibles,
directivas para rastreadores y `/llms.txt`. Estas mejoras ayudan a interpretar el contenido,
pero no garantizan posiciones en buscadores ni menciones de asistentes de IA.

También funciona en Vercel o Netlify con la misma configuración.

## Pendientes antes de publicar

- [ ] Revisar el número de WhatsApp y el correo en `src/data/site.ts`.
- [ ] Revisar los textos legales con un abogado/contador.
- [ ] Confirmar que el dominio `windytech.studio` apunta al deploy.
- [ ] Configurar correo profesional (`hola@windytech.studio`) y redirigirlo si hace falta.
- [ ] Añadir analítica (GA4 o Plausible) cuando exista una cuenta.
- [ ] Añadir Google Business Profile y redes sociales.
- [ ] Reemplazar la página de equipos por el catálogo cuando haya precios, stock y garantía.

## Fase 2: catálogo

Cuando el catálogo esté listo, se puede agregar:

- `src/data/catalog.ts` con SKUs, categorías, condición, precio y stock.
- `/catalogo/` y `/en/catalog/` con filtros.
- Ficha por producto con botón de WhatsApp y mensaje precargado.
- Administración por JSON o CMS ligero (Sanity/Decap).

No se recomienda publicar precios o plazos de equipos hasta confirmar proveedor, margen,
garantía y logística.

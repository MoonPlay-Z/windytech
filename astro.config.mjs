import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import node from '@astrojs/node';

// El sitio se despliega en Render como servicio Node persistente.
// Las páginas de marketing siguen siendo estáticas; /api, /admin y las
// páginas de catálogo se renderizan bajo demanda (prerender = false).
export default defineConfig({
  site: 'https://windytech.studio',
  integrations: [icon()],
  adapter: node({ mode: 'standalone' }),
  output: 'server',
  // Detrás de Render/Cloudflare el origen puede llegar como http/https o
  // apex/www. Nuestro middleware y `sameOrigin()` comparan el host real.
  security: {
    checkOrigin: false,
  },
  // Las URLs públicas de productos importados ya no incluyen el id del item
  // de eBay. Estas redirecciones conservan los enlaces compartidos antes del
  // cambio.
  redirects: {
    '/catalogo/dell-latitude-7420-14-fhd-i7-1185g7-16gb-256gb-ssd-new-v1-110591463017-0':
      '/catalogo/dell-latitude-7420-14-fhd-i7-1185g7-16gb-256gb-ssd-new',
    '/catalogo/lenovo-thinkpad-t16-gen-5-amd-laptop-21wx002pus-v1-110591578540-0':
      '/catalogo/lenovo-thinkpad-t16-gen-5-amd-laptop-21wx002pus',
    // Corrección del mapa local: "Valle de Aragua" es una región y
    // "Portuguesa" es un estado, no una ciudad de Barinas.
    '/valle-de-aragua/': '/la-victoria/',
    '/portuguesa/': '/guanare/',
  },
  // Precarga los enlaces al pasar el ratón para que la navegación cliente sea
  // casi instantánea, incluso en páginas renderizadas bajo demanda.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
  server: {
    host: true,
  },
});

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

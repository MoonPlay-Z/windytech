import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import node from '@astrojs/node';

// El sitio se despliega en Render como servicio Node persistente.
// Las páginas de marketing siguen siendo estáticas; /api, /admin y las
// páginas de catálogo se renderizan bajo demanda (prerender = false).
export default defineConfig({
  site: 'https://www.windytech.studio',
  integrations: [icon()],
  adapter: node({ mode: 'standalone' }),
  output: 'static',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
  server: {
    host: true,
  },
});

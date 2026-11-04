import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://windytech.studio',
  integrations: [icon()],
  build: {
    format: 'directory',
  },
});

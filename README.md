# Windy Tech — sitio web

Sitio bilingüe en Astro. El código de la web está en [`web/`](./web/).

## Desarrollo

```bash
cd web
npm install
npm run dev
```

## Construcción

```bash
cd web
npm run build
```

## Despliegue

Para Cloudflare Pages, configura `web` como directorio raíz, `npm run build` como
comando de construcción y `dist` como directorio de salida.

# AGENTS.md — windytech-web

Spanish-language marketing + services site for Windytech. Astro 7 (SSR via
`@astrojs/node`) + Drizzle ORM + PostgreSQL (Neon), deployed on Render.

## Commands

```bash
npm install
npm run dev        # dev server → http://localhost:4321
npm run build      # astro build && tsx scripts/generate-sitemap.ts
npm run preview
npm run check      # astro check (types + Astro templates) — the only typecheck step
npm run css:audit  # node scripts/audit-css.mjs — clases CSS huérfanas / sin estilo
npm test           # tsx --test src/lib/*.test.ts (node:test runner)
npm run test:pricing  # single file: src/lib/pricing.test.ts
npx tsx --test src/lib/<name>.test.ts   # single lib test, e.g. src/lib/security.test.ts

npm run sitemap         # regenerate dist/sitemap.xml (build already runs it)
npm run seo:check       # node scripts/check-seo.mjs (needs dist/ static HTML or live site)
npm run indexnow        # node scripts/indexnow.mjs

npm run db:generate     # drizzle-kit generate
npm run db:push         # drizzle-kit push (alias: db:migrate — do NOT run raw `drizzle-kit migrate`)
npm run db:studio
npm run seed:casos      # tsx scripts/seed-case-studies.ts
```

Verification order (mirrors CI): `npm run check && npm test && npm run build`

## CI / deploy

- `.github/workflows/seo.yml`: push to `main` + PRs run `npm ci`,
  `npm audit --audit-level=critical`, `npm run check`, `npm test`,
  `npm run build`. `indexnow` job is manual dispatch only.
- Deploy on Render: build `npm ci && npm run build`, start `node dist/server/entry.mjs`
  (see `render.yaml`).

## Environment

- Node **22.23.4+** (Astro 7). `.nvmrc` included; CI and Render use Node 22.
- Copy `.env.example` → `.env` (`.env` is gitignored). Server-side access goes
  through `serverEnv` in `src/lib/env.ts` (process.env + Astro `import.meta.env`
  fallback, strips surrounding quotes).
- Needs real values for: `DATABASE_URL` (Neon), `SESSION_SECRET`, `ADMIN_BOOTSTRAP_*`.
- Cloudinary (panel image upload) is optional; without the vars the panel responds
  `Cloudinary no está configurado en este entorno` and the site keeps working.
- eBay integration vars: `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `EBAY_DEV_ID`,
  `EBAY_REFRESH_TOKEN`, `EBAY_SANDBOX` (default `true`), `EBAY_ACCESS_TOKEN`
  (manual token, expires ~2h, not for production).

## Architecture notes

- Astro 5 SSR: `output: 'server'` + `@astrojs/node` standalone adapter; build format
  `directory` → production entry `dist/server/entry.mjs`.
- DB access: Drizzle + `pg`, pool kept on `globalThis` (`src/lib/db/index.ts`).
  `getDb()` returns `null` without `DATABASE_URL` — pages degrade to empty states.
- Content lives in `src/data/*.ts` (site, services, about, legal, empresa, ciudades).
  Edits to texts/prices/services go there.
- Icons: registry in `src/lib/icons.ts`, grouped by family; templates must only use
  registered `<Icon name>`s — enforced by `src/lib/icons.test.ts`.
- Contact form has no backend: builds a WhatsApp link client-side.
- Middleware (`src/middleware.ts`): security headers, custom `sameOrigin` CSRF check
  (Astro's `checkOrigin` is disabled), cache-control rules, `noindex` for `/api`,
  `/admin`, `/cotizacion/[id]`. Production builds also send CSP, HSTS, COOP, CORP and
  `X-Permitted-Cross-Domain-Policies` (gated by `import.meta.env.PROD`, not `NODE_ENV`).
- Site is Spanish-only: `/en/*` → 301 redirect to Spanish equivalent (middleware).

## Gotchas

- Do NOT run raw `drizzle-kit migrate` — `drizzle/` is historical SQL without a
  migrations journal. Use `npm run db:push` (current schema source of truth:
  `src/lib/db/schema.ts`).
- `npm run build` already runs the sitemap script; it reads product/project/blog
  content from the DB, so generate it with `DATABASE_URL` set (it falls back to
  reading `.env` when unset).
- `npm run seo:check` needs static HTML in `dist/` or the live site; since this is SSR
  (`output: 'server'`), `dist/` has no prerendered HTML in CI → run against the
  deployed site: `node scripts/check-seo.mjs --site=https://windytech.studio`.
- No lint/format tooling is configured; do not introduce or run ESLint/Prettier.
- Spanish docs live in `documentacion/` (`SEO-GEO.md`, `MANUAL-SEO.md`,
  `GUIA-SEARCH-CONSOLE.md`, `PROTOCOLO-REVISION-CSS.md`, `SISTEMA-TIEMPO-REAL.md`).
  `README.md` and `AGENTS.md` stay at the repo root.

## Testing quirks

- Tests use `node:test` via `tsx` (`*.test.ts` under `src/lib/`).
- `npm test` runs the `src/lib/*.test.ts` glob; a focused run is
  `npm run test:pricing` or `npx tsx --test src/lib/<file>.test.ts`.
- DB-backed behavior is not covered by unit tests here; no test services required.

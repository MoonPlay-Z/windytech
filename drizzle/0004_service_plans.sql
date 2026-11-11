-- Paquetes de servicios (planes): lo que el cliente puede contratar.
-- Nombre, contenido del paquete, costo y tiempo de aplicación, en ES y EN.

CREATE TABLE IF NOT EXISTS service_plans (
  id SERIAL PRIMARY KEY,
  service_key TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_period TEXT NOT NULL DEFAULT 'one_time',
  delivery_time TEXT NOT NULL DEFAULT '',
  badge TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS service_plans_active_idx ON service_plans (is_active);

CREATE TABLE IF NOT EXISTS service_plan_translations (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES service_plans(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  includes TEXT[] NOT NULL DEFAULT '{}',
  UNIQUE (locale, slug)
);

CREATE INDEX IF NOT EXISTS service_plan_translations_plan_idx ON service_plan_translations (plan_id);

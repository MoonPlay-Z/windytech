-- Migración inicial del catálogo Windytech (Neon PostgreSQL + Drizzle)
-- Generada a partir de src/lib/db/schema.ts

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE locale AS ENUM ('es', 'en');
CREATE TYPE product_condition AS ENUM ('NEW', 'REFURBISHED_A', 'USED');
CREATE TYPE availability AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'PREORDER');
CREATE TYPE promo_type AS ENUM ('PERCENT', 'FIXED');
CREATE TYPE quote_currency AS ENUM ('USD', 'VES');
CREATE TYPE quote_status AS ENUM ('NEW', 'CONTACTED', 'QUOTED', 'CLOSED', 'LOST');
CREATE TYPE admin_role AS ENUM ('OWNER', 'EDITOR');

-- Categorías
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  image_public_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE category_translations (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  UNIQUE (locale, slug)
);

-- Productos
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  brand TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  condition product_condition NOT NULL DEFAULT 'NEW',
  price_cents INTEGER NOT NULL,
  compare_at_cents INTEGER,
  sku TEXT NOT NULL DEFAULT '',
  availability availability NOT NULL DEFAULT 'IN_STOCK',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  specs JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE product_translations (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  description_md TEXT NOT NULL DEFAULT '',
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  UNIQUE (locale, slug)
);

CREATE TABLE product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL DEFAULT '',
  attributes JSONB NOT NULL DEFAULT '{}',
  price_cents INTEGER,
  compare_at_cents INTEGER,
  availability availability NOT NULL DEFAULT 'IN_STOCK',
  image_public_id TEXT,
  label_es TEXT NOT NULL DEFAULT '',
  label_en TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
  cloudinary_public_id TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  width INTEGER,
  height INTEGER,
  format TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false
);

-- Promociones
CREATE TABLE promotions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type promo_type NOT NULL,
  value INTEGER NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  badge_es TEXT NOT NULL DEFAULT '',
  badge_en TEXT NOT NULL DEFAULT '',
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE promotion_targets (
  id SERIAL PRIMARY KEY,
  promotion_id INTEGER NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE
);

-- Cotizaciones
CREATE TABLE quotes (
  id SERIAL PRIMARY KEY,
  number TEXT UNIQUE,
  public_token TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  locale locale NOT NULL DEFAULT 'es',
  currency quote_currency NOT NULL DEFAULT 'USD',
  rate_snapshot NUMERIC(14, 4),
  rate_date DATE,
  subtotal_cents INTEGER NOT NULL,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  total_ves_cents INTEGER,
  status quote_status NOT NULL DEFAULT 'NEW',
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  whatsapp_sent_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE quote_items (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
  name_snapshot TEXT NOT NULL,
  attributes_snapshot JSONB NOT NULL DEFAULT '{}',
  unit_price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  line_total_cents INTEGER NOT NULL
);

-- Proyectos
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  year INTEGER,
  client_name TEXT NOT NULL DEFAULT '',
  client_approved BOOLEAN NOT NULL DEFAULT false,
  services TEXT[] NOT NULL DEFAULT '{}',
  cover_public_id TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE project_translations (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  description_md TEXT NOT NULL DEFAULT '',
  UNIQUE (locale, slug)
);

CREATE TABLE project_images (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  cloudinary_public_id TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0
);

-- Publicaciones (blog)
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  cover_public_id TEXT,
  author TEXT NOT NULL DEFAULT 'Windytech',
  tags TEXT[] NOT NULL DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE post_translations (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  locale locale NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body_md TEXT NOT NULL DEFAULT '',
  UNIQUE (locale, slug)
);

-- Media
CREATE TABLE media (
  id SERIAL PRIMARY KEY,
  public_id TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT '',
  width INTEGER,
  height INTEGER,
  bytes INTEGER,
  folder TEXT NOT NULL DEFAULT '',
  alt TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Administración
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role admin_role NOT NULL DEFAULT 'EDITOR',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_hash TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  actor_id INTEGER,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL DEFAULT '',
  diff JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE exchange_rates (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  rate NUMERIC(14, 4) NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_manual BOOLEAN NOT NULL DEFAULT false
);

-- Índices de uso frecuente
CREATE INDEX category_translations_category_idx ON category_translations(category_id);
CREATE INDEX products_category_idx ON products(category_id);
CREATE INDEX products_active_idx ON products(is_active);
CREATE INDEX product_translations_product_idx ON product_translations(product_id);
CREATE INDEX product_variants_product_idx ON product_variants(product_id);
CREATE INDEX product_images_product_idx ON product_images(product_id);
CREATE INDEX promotion_targets_promotion_idx ON promotion_targets(promotion_id);
CREATE INDEX quotes_status_idx ON quotes(status);
CREATE INDEX quote_items_quote_idx ON quote_items(quote_id);
CREATE INDEX project_translations_project_idx ON project_translations(project_id);
CREATE INDEX project_images_project_idx ON project_images(project_id);
CREATE INDEX post_translations_post_idx ON post_translations(post_id);
CREATE INDEX admin_users_role_idx ON admin_users(role);
CREATE INDEX sessions_admin_idx ON sessions(admin_id);
CREATE INDEX audit_log_created_idx ON audit_log(created_at);
CREATE INDEX exchange_rates_fetched_idx ON exchange_rates(fetched_at);

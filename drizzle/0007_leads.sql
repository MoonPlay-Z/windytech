-- Leads: consultas que llegan por el formulario de contacto (o por WhatsApp
-- con el formulario abierto). Sirven de embudo y permiten medir el canal.

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  business TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  service TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  channel TEXT NOT NULL DEFAULT 'web',
  source TEXT NOT NULL DEFAULT '',
  campaign TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  customer_id INTEGER REFERENCES customer_accounts(id) ON DELETE SET NULL,
  tracking_id INTEGER REFERENCES service_trackings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC);

-- Novedades del cliente: lo que el panel muestra como "pendiente".
CREATE TABLE IF NOT EXISTS customer_notifications (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
  tracking_id INTEGER REFERENCES service_trackings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  channel TEXT NOT NULL DEFAULT 'panel',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS customer_notifications_customer_idx ON customer_notifications (customer_id, created_at DESC);

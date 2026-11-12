-- Módulo de seguimiento: los clientes ven el estado de los servicios,
-- suscripciones, proyectos, cotizaciones y equipos que compraron.

CREATE TABLE IF NOT EXISTS service_trackings (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'service',
  title TEXT NOT NULL,
  reference TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'solicitado',
  progress INTEGER NOT NULL DEFAULT 0,
  summary TEXT NOT NULL DEFAULT '',
  eta DATE,
  public_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS service_trackings_customer_idx ON service_trackings (customer_id);
CREATE INDEX IF NOT EXISTS service_trackings_kind_idx ON service_trackings (kind);

-- Historial de cambios de cada seguimiento.
CREATE TABLE IF NOT EXISTS tracking_events (
  id SERIAL PRIMARY KEY,
  tracking_id INTEGER NOT NULL REFERENCES service_trackings(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  note TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT 'Windytech',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tracking_events_tracking_idx ON tracking_events (tracking_id);

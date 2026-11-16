-- Tarjetas personalizadas para compartir en redes sociales.
-- entity_type: global | product | service
-- entity_id: vacío para global, id del producto o slug del servicio.

CREATE TABLE IF NOT EXISTS social_share_cards (
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL DEFAULT '',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (entity_type, entity_id)
);

-- Publicaciones: URL del embed de LinkedIn para integrarlo en el artículo.

ALTER TABLE posts ADD COLUMN IF NOT EXISTS linkedin_embed_url TEXT;

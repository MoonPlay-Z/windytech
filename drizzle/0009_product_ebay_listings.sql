-- Catálogo para reventa en eBay: costo, margen de reventa, envío incluido,
-- estimación de entrega y vínculo con el item de eBay.

ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS resale_margin_percent INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_cost_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_estimate_days INTEGER NOT NULL DEFAULT 21;
ALTER TABLE products ADD COLUMN IF NOT EXISTS ebay_item_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS ebay_status TEXT NOT NULL DEFAULT 'draft';

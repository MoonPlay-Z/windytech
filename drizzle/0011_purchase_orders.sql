-- Órdenes de compra creadas cuando un cliente pide un producto.
-- Guardan los datos del cliente, lo que compró (con su descripción) y el item
-- de eBay para poder buscarlo o reponerlo después desde el panel.

CREATE TABLE IF NOT EXISTS purchase_orders (
  id SERIAL PRIMARY KEY,
  number TEXT UNIQUE,
  quote_id INTEGER REFERENCES quotes(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  customer_id INTEGER REFERENCES customer_accounts(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT NOT NULL DEFAULT '',
  ebay_item_id TEXT,
  ebay_item_url TEXT,
  status TEXT NOT NULL DEFAULT 'NEW',
  total_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS purchase_orders_created_idx ON purchase_orders (created_at);
CREATE INDEX IF NOT EXISTS purchase_orders_quote_idx ON purchase_orders (quote_id);

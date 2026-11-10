import { db } from './db/client.js';
import { v4 as uuidv4 } from 'uuid';

// Hybrid serialization: campos crudos para componentes, price/image serializados para carrito
export function serializeProduct(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    description: raw.description,
    priceCents: raw.price_cents,
    price: raw.price_cents ? (raw.price_cents / 100).toFixed(2) : null,
    currency: raw.currency || 'USD',
    images: raw.images || [],
    variants: raw.variants || [],
    rules: raw.rules || [],
    brand: raw.brand,
    category: raw.category,
    promoted: raw.promoted,
    // Campos listos para el carrito (pre-serializados)
    displayPrice: raw.price_cents ? `$${(raw.price_cents / 100).toFixed(2)}` : null,
    mainImage: raw.images && raw.images.length > 0 ? raw.images[0] : null,
  };
}

export async function listProducts(filters = {}) {
  const { locale = 'es', promotedOnly, category, search } = filters;
  const condition = [];
  const params = [];
  let i = 1;

  if (promotedOnly) {
    condition.push(`p.promoted = true`);
  }
  if (category) {
    condition.push(`c.slug = $${i}`);
    params.push(category);
    i++;
  }
  if (search) {
    condition.push(`(p.name ILIKE $${i} OR p.description ILIKE $${i})`);
    params.push(`%${search}%`);
    i++;
  }

  const where = condition.length > 0 ? `WHERE ${condition.join(' AND ')}` : '';

  const result = await db.query(
    `SELECT p.*, c.slug as category_slug, b.slug as brand_slug
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN brands b ON p.brand_id = b.id
     ${where}
     ORDER BY p.created_at DESC
     LIMIT 50`,
    params
  );

  return result.rows.map(serializeProduct);
}

export async function getProductBySlug(slug, locale = 'es') {
  const result = await db.query(
    'SELECT p.*, c.slug as category_slug, b.slug as brand_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN brands b ON p.brand_id = b.id WHERE p.slug = $1',
    [slug]
  );
  const row = result.rows[0];
  if (!row) return null;
  return serializeProduct(row);
}

export async function listCategories() {
  const result = await db.query('SELECT * FROM categories ORDER BY name');
  return result.rows;
}

export async function listBrands() {
  const result = await db.query('SELECT * FROM brands ORDER BY name');
  return result.rows;
}
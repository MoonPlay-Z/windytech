import { sql, type SQL } from 'drizzle-orm';
import { getDb } from './index';
import type {
  CatalogProduct,
  Category,
  PostSummary,
  ProjectSummary,
  PublicQuote,
  QuoteStatus,
  ServicePlan,
} from '../catalog';
import type { PromotionRule } from '../pricing';

type Row = Record<string, unknown>;

function db() {
  return getDb();
}

async function safeRows<T = Row>(query: SQL): Promise<T[]> {
  const client = db();
  if (!client) return [];
  try {
    const result = await client.execute(query);
    return result.rows as T[];
  } catch (error) {
    console.error('[db] consulta fallida:', (error as Error).message);
    return [];
  }
}

async function one<T = Row>(query: SQL): Promise<T | null> {
  const list = await safeRows<T>(query);
  return list[0] ?? null;
}

function inList(ids: number[]): SQL {
  return sql.join(
    ids.map((id) => sql`${id}`),
    sql`, `,
  );
}

/**
 * Serializa un arreglo de strings como literal de PostgreSQL (`{a,b}`).
 * Necesario porque Drizzle interpreta un array embebido en `sql` como una
 * lista de placeholders y no como el valor de una columna `text[]`.
 */
function textArrayLiteral(values: string[]): string {
  const escaped = values.map(
    (value) => `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`,
  );
  return `{${escaped.join(',')}}`;
}

/* ------------------------------------------------------------------ */
/* Catálogo público                                                    */
/* ------------------------------------------------------------------ */

export async function getCategories(): Promise<Category[]> {
  const rows = await safeRows(
    sql`SELECT c.id, t.slug, t.name, t.description, c.image_public_id AS "imagePublicId",
               (SELECT COUNT(*)::int FROM products p WHERE p.category_id = c.id AND p.is_active = true) AS "productCount"
        FROM categories c
        JOIN category_translations t ON t.category_id = c.id AND t.locale = 'es'
        ORDER BY c.sort_order ASC, t.name ASC`,
  );
  return rows as unknown as Category[];
}

export async function getPromotionRules(now: Date = new Date()): Promise<PromotionRule[]> {
  const rows = await safeRows(
    sql`SELECT id, type, value, priority, starts_at AS "startsAt", ends_at AS "endsAt",
               is_active AS "isActive", badge_es AS "badgeEs", badge_en AS "badgeEn"
        FROM promotions
        WHERE is_active = true
          AND starts_at <= ${now}
          AND (ends_at IS NULL OR ends_at >= ${now})
        ORDER BY priority DESC, id ASC`,
  );
  if (rows.length === 0) return [];

  const ids = rows.map((row) => Number(row.id));
  const targets = await safeRows(
    sql`SELECT promotion_id AS "promotionId", product_id AS "productId", category_id AS "categoryId"
        FROM promotion_targets WHERE promotion_id IN (${inList(ids)})`,
  );

  return rows.map((row) => {
    const id = Number(row.id);
    const own = targets.filter((target) => Number(target.promotionId) === id);
    return {
      id,
      type: String(row.type) as PromotionRule['type'],
      value: Number(row.value),
      priority: Number(row.priority),
      startsAt: row.startsAt as Date,
      endsAt: (row.endsAt as Date | null) ?? null,
      isActive: Boolean(row.isActive),
      badgeEs: String(row.badgeEs ?? ''),
      badgeEn: String(row.badgeEn ?? ''),
      productIds: own.filter((t) => t.productId !== null).map((t) => Number(t.productId)),
      categoryIds: own.filter((t) => t.categoryId !== null).map((t) => Number(t.categoryId)),
    };
  });
}

export type CatalogFilters = {
  category?: string;
  condition?: string;
  brand?: string;
  minCents?: number;
  maxCents?: number;
  search?: string;
  limit?: number;
};

export async function getCatalog(filters: CatalogFilters): Promise<CatalogProduct[]> {
  const conditions: SQL[] = [sql`p.is_active = true`];

  if (filters.category) {
    conditions.push(sql`t.slug = ${filters.category}`);
  }
  if (filters.condition) {
    conditions.push(sql`p.condition = ${filters.condition}`);
  }
  if (filters.brand) {
    conditions.push(sql`p.brand = ${filters.brand}`);
  }
  if (typeof filters.minCents === 'number') {
    conditions.push(sql`p.price_cents >= ${filters.minCents}`);
  }
  if (typeof filters.maxCents === 'number') {
    conditions.push(sql`p.price_cents <= ${filters.maxCents}`);
  }
  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      sql`(t.name ILIKE ${term} OR p.brand ILIKE ${term} OR p.model ILIKE ${term} OR p.sku ILIKE ${term})`,
    );
  }

  const where = sql.join(conditions, sql` AND `);
  const limit = Math.min(Math.max(filters.limit ?? 200, 1), 500);

  const rows = await safeRows(
    sql`SELECT p.id, p.category_id AS "categoryId", p.brand, p.model, p.condition,
               p.price_cents AS "priceCents", p.compare_at_cents AS "compareAtCents",
               p.sku, p.availability, p.is_featured AS "isFeatured", p.specs,
               t.slug, t.name, t.short_description AS "shortDescription"
        FROM products p
        JOIN product_translations t ON t.product_id = p.id AND t.locale = 'es'
        WHERE ${where}
        ORDER BY p.is_featured DESC, p.created_at DESC
        LIMIT ${limit}`,
  );

  if (rows.length === 0) return [];

  const ids = rows.map((row) => Number(row.id));
  const [images, variants, rules] = await Promise.all([
    safeRows(
      sql`SELECT id, product_id AS "productId", variant_id AS "variantId",
                 cloudinary_public_id AS "cloudinaryPublicId", alt, position, is_primary AS "isPrimary"
          FROM product_images WHERE product_id IN (${inList(ids)})
          ORDER BY is_primary DESC, position ASC`,
    ),
    safeRows(
      sql`SELECT id, product_id AS "productId", sku, attributes,
                 price_cents AS "priceCents", compare_at_cents AS "compareAtCents",
                 availability, image_public_id AS "imagePublicId",
                 label_es AS "labelEs", position
          FROM product_variants WHERE product_id IN (${inList(ids)})
          ORDER BY position ASC, id ASC`,
    ),
    getPromotionRules(),
  ]);

  return rows.map((row) => {
    const id = Number(row.id);
    return {
      ...(row as unknown as CatalogProduct),
      id,
      images: images.filter((image) => Number(image.productId) === id) as CatalogProduct['images'],
      variants: variants.filter((variant) => Number(variant.productId) === id) as CatalogProduct['variants'],
      rules,
    };
  });
}

export async function getProduct(slug: string): Promise<CatalogProduct | null> {
  const row = await one(
    sql`SELECT p.id, p.category_id AS "categoryId", p.brand, p.model, p.condition,
               p.price_cents AS "priceCents", p.compare_at_cents AS "compareAtCents",
               p.sku, p.availability, p.is_featured AS "isFeatured", p.specs,
               t.slug, t.name, t.short_description AS "shortDescription",
               t.description_md AS "descriptionMd", t.seo_title AS "seoTitle",
               t.seo_description AS "seoDescription"
        FROM products p
        JOIN product_translations t ON t.product_id = p.id AND t.locale = 'es'
        WHERE p.is_active = true AND t.slug = ${slug}
        LIMIT 1`,
  );
  if (!row) return null;

  const id = Number(row.id);
  const [images, variants, rules] = await Promise.all([
    safeRows(
      sql`SELECT id, product_id AS "productId", variant_id AS "variantId",
                 cloudinary_public_id AS "cloudinaryPublicId", alt, position, is_primary AS "isPrimary"
          FROM product_images WHERE product_id = ${id} ORDER BY is_primary DESC, position ASC`,
    ),
    safeRows(
      sql`SELECT id, product_id AS "productId", sku, attributes,
                 price_cents AS "priceCents", compare_at_cents AS "compareAtCents",
                 availability, image_public_id AS "imagePublicId",
                 label_es AS "labelEs", position
          FROM product_variants WHERE product_id = ${id} ORDER BY position ASC, id ASC`,
    ),
    getPromotionRules(),
  ]);

  return {
    ...(row as unknown as CatalogProduct),
    id,
    images,
    variants,
    rules,
  } as CatalogProduct;
}

/** Productos por id con traducción del idioma pedido (para recalcular cotizaciones). */
export async function getProductsByIds(ids: number[]): Promise<CatalogProduct[]> {
  if (ids.length === 0) return [];
  const rows = await safeRows(
    sql`SELECT p.id, p.category_id AS "categoryId", p.brand, p.model, p.condition,
               p.price_cents AS "priceCents", p.compare_at_cents AS "compareAtCents",
               p.sku, p.availability, p.is_featured AS "isFeatured", p.specs,
               COALESCE(t.slug, '') AS slug, COALESCE(t.name, p.model) AS name,
               COALESCE(t.short_description, '') AS "shortDescription"
        FROM products p
        LEFT JOIN product_translations t ON t.product_id = p.id AND t.locale = 'es'
        WHERE p.is_active = true AND p.id IN (${inList(ids)})`,
  );
  if (rows.length === 0) return [];

  const variantRows = await safeRows(
    sql`SELECT id, product_id AS "productId", sku, attributes,
               price_cents AS "priceCents", compare_at_cents AS "compareAtCents",
               availability, image_public_id AS "imagePublicId",
               label_es AS "labelEs", position
        FROM product_variants WHERE product_id IN (${inList(ids)})`,
  );
  const rules = await getPromotionRules();

  return rows.map((row) => ({
    ...(row as unknown as CatalogProduct),
    id: Number(row.id),
    images: [],
    variants: variantRows.filter((variant) => Number(variant.productId) === Number(row.id)),
    rules,
  })) as unknown as CatalogProduct[];
}

export async function getProductSlug(productId: number): Promise<string | null> {
  const row = await one(
    sql`SELECT slug FROM product_translations WHERE product_id = ${productId} AND locale = 'es' LIMIT 1`,
  );
  return row ? String(row.slug) : null;
}

export async function getBrands(): Promise<string[]> {
  const rows = await safeRows(
    sql`SELECT DISTINCT brand FROM products WHERE is_active = true AND brand <> '' ORDER BY brand ASC`,
  );
  return rows.map((row) => String(row.brand));
}

/* ------------------------------------------------------------------ */
/* Proyectos y blog                                                    */
/* ------------------------------------------------------------------ */

export async function getProjects(): Promise<ProjectSummary[]> {
  const rows = await safeRows(
    sql`SELECT p.id, p.year, p.client_name AS "clientName", p.services,
               p.cover_public_id AS "coverPublicId",
               t.slug, t.title, t.summary
        FROM projects p
        JOIN project_translations t ON t.project_id = p.id AND t.locale = 'es'
        WHERE p.is_published = true AND p.client_approved = true
        ORDER BY p.sort_order ASC, p.year DESC NULLS LAST, p.id DESC`,
  );
  return rows as unknown as ProjectSummary[];
}

export async function getProject(slug: string): Promise<ProjectSummary | null> {
  const row = await one(
    sql`SELECT p.id, p.year, p.client_name AS "clientName", p.services,
               p.cover_public_id AS "coverPublicId",
               t.slug, t.title, t.summary, t.description_md AS "descriptionMd"
        FROM projects p
        JOIN project_translations t ON t.project_id = p.id AND t.locale = 'es'
        WHERE p.is_published = true AND p.client_approved = true AND t.slug = ${slug}
        LIMIT 1`,
  );
  if (!row) return null;
  const id = Number(row.id);
  const images = await safeRows(
    sql`SELECT cloudinary_public_id AS "cloudinaryPublicId", alt, position
        FROM project_images WHERE project_id = ${id} ORDER BY position ASC, id ASC`,
  );
  return { ...(row as unknown as ProjectSummary), id, images } as ProjectSummary;
}

export async function getPosts(): Promise<PostSummary[]> {
  const rows = await safeRows(
    sql`SELECT p.id, p.cover_public_id AS "coverPublicId", p.author, p.tags,
               p.published_at AS "publishedAt",
               t.slug, t.title, t.excerpt
        FROM posts p
        JOIN post_translations t ON t.post_id = p.id AND t.locale = 'es'
        WHERE p.is_published = true AND (p.published_at IS NULL OR p.published_at <= now())
        ORDER BY p.published_at DESC NULLS LAST, p.id DESC`,
  );
  return rows as unknown as PostSummary[];
}

export async function getPost(slug: string): Promise<PostSummary | null> {
  const row = await one(
    sql`SELECT p.id, p.cover_public_id AS "coverPublicId", p.author, p.tags,
               p.published_at AS "publishedAt",
               t.slug, t.title, t.excerpt, t.body_md AS "bodyMd"
        FROM posts p
        JOIN post_translations t ON t.post_id = p.id AND t.locale = 'es'
        WHERE p.is_published = true AND (p.published_at IS NULL OR p.published_at <= now())
          AND t.slug = ${slug}
        LIMIT 1`,
  );
  return (row as unknown as PostSummary) ?? null;
}

export async function countProducts(): Promise<number> {
  const row = await one(sql`SELECT COUNT(*)::int AS total FROM products WHERE is_active = true`);
  return row ? Number(row.total) : 0;
}

/* ------------------------------------------------------------------ */
/* Cotizaciones                                                        */
/* ------------------------------------------------------------------ */

export type QuoteRow = {
  id: number;
  number: string | null;
  publicToken: string;
  customerName: string;
  phone: string;
  email: string;
  customerId: number | null;
  status: string;
  totalCents: number;
  createdAt: string;
};

/** Cotización con el cliente asociado (para el panel y el cierre). */
export async function getQuoteById(id: number): Promise<QuoteRow | null> {
  return one<QuoteRow>(
    sql`SELECT id, number, public_token AS "publicToken", customer_name AS "customerName",
               phone, email, customer_id AS "customerId", status,
               total_cents AS "totalCents", created_at::text AS "createdAt"
        FROM quotes WHERE id = ${id} LIMIT 1`,
  );
}

export async function createQuote(data: {
  number: string | null;
  publicToken: string;
  customerName: string;
  phone: string;
  email: string;
  customerId?: number | null;
  notes: string;
  locale: string;
  currency: 'USD' | 'VES';
  rateSnapshot: number | null;
  rateDate: string | null;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  totalVesCents: number | null;
  validUntil: Date;
  items: {
    productId: number | null;
    variantId: number | null;
    nameSnapshot: string;
    attributesSnapshot: Record<string, string>;
    unitPriceCents: number;
    quantity: number;
    lineTotalCents: number;
  }[];
}): Promise<{ number: string; token: string } | null> {
  const client = db();
  if (!client) return null;

  return client.transaction(async (tx) => {
    const inserted = await tx.execute(
      sql`INSERT INTO quotes (number, public_token, customer_name, phone, email, customer_id, notes, locale,
              currency, rate_snapshot, rate_date, subtotal_cents, discount_cents, tax_cents,
              total_cents, total_ves_cents, status, valid_until)
          VALUES (${data.number}, ${data.publicToken}, ${data.customerName}, ${data.phone},
              ${data.email}, ${data.customerId ?? null}, ${data.notes}, ${data.locale}, ${data.currency},
              ${data.rateSnapshot}, ${data.rateDate}, ${data.subtotalCents}, ${data.discountCents},
              ${data.taxCents}, ${data.totalCents}, ${data.totalVesCents}, 'NEW', ${data.validUntil})
          RETURNING id, number`,
    );
    const quote = inserted.rows[0] as { id: number; number: string | null };

    let number = quote.number;
    if (!number) {
      const year = new Date().getFullYear();
      number = `WQ-${year}-${String(quote.id).padStart(4, '0')}`;
      await tx.execute(sql`UPDATE quotes SET number = ${number} WHERE id = ${quote.id}`);
    }

    for (const item of data.items) {
      await tx.execute(
        sql`INSERT INTO quote_items (quote_id, product_id, variant_id, name_snapshot,
                attributes_snapshot, unit_price_cents, quantity, line_total_cents)
            VALUES (${quote.id}, ${item.productId}, ${item.variantId}, ${item.nameSnapshot},
                ${JSON.stringify(item.attributesSnapshot)}::jsonb, ${item.unitPriceCents},
                ${item.quantity}, ${item.lineTotalCents})`,
      );
    }

    return { number, token: data.publicToken };
  });
}

export async function getQuoteByToken(token: string): Promise<PublicQuote | null> {
  const row = await one(
    sql`SELECT id, number, public_token AS "publicToken", customer_name AS "customerName",
               phone, email, notes, locale, currency, rate_snapshot AS "rateSnapshot",
               rate_date AS "rateDate", subtotal_cents AS "subtotalCents",
               discount_cents AS "discountCents", tax_cents AS "taxCents",
               total_cents AS "totalCents", total_ves_cents AS "totalVesCents",
               status, valid_until AS "validUntil", created_at AS "createdAt"
        FROM quotes WHERE public_token = ${token} LIMIT 1`,
  );
  if (!row) return null;

  const id = Number(row.id);
  const items = await safeRows(
    sql`SELECT name_snapshot AS "nameSnapshot", attributes_snapshot AS "attributesSnapshot",
               unit_price_cents AS "unitPriceCents", quantity, line_total_cents AS "lineTotalCents"
        FROM quote_items WHERE quote_id = ${id} ORDER BY id ASC`,
  );

  return { ...(row as unknown as PublicQuote), id, items } as PublicQuote;
}

/* ------------------------------------------------------------------ */
/* Tasas de cambio                                                     */
/* ------------------------------------------------------------------ */

export async function getLatestRate(): Promise<{ rate: number; date: string; isManual: boolean } | null> {
  const row = await one(
    sql`SELECT rate, fetched_at AS "fetchedAt", is_manual AS "isManual"
        FROM exchange_rates ORDER BY fetched_at DESC LIMIT 1`,
  );
  if (!row) return null;
  const rate = Number(row.rate);
  if (!Number.isFinite(rate) || rate <= 0) return null;
  return {
    rate,
    date: new Date(row.fetchedAt as string).toISOString().slice(0, 10),
    isManual: Boolean(row.isManual),
  };
}

export async function saveRate(rate: number, source: string, isManual = false): Promise<boolean> {
  const client = db();
  if (!client || !Number.isFinite(rate) || rate <= 0) return false;
  try {
    await client.execute(
      sql`INSERT INTO exchange_rates (source, rate, is_manual) VALUES (${source}, ${rate}, ${isManual})`,
    );
    return true;
  } catch (error) {
    console.error('[db] no se pudo guardar la tasa:', (error as Error).message);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Administración                                                      */
/* ------------------------------------------------------------------ */

export async function findAdminByEmail(email: string) {
  return one<{ id: number; email: string; passwordHash: string; role: 'OWNER' | 'EDITOR'; isActive: boolean }>(
    sql`SELECT id, email, password_hash AS "passwordHash", role, is_active AS "isActive"
        FROM admin_users WHERE lower(email) = lower(${email}) LIMIT 1`,
  );
}

export async function findAdminById(id: number) {
  return one<{ id: number; email: string; role: 'OWNER' | 'EDITOR'; isActive: boolean }>(
    sql`SELECT id, email, role, is_active AS "isActive" FROM admin_users WHERE id = ${id} LIMIT 1`,
  );
}

export async function createAdmin(email: string, passwordHash: string, role: 'OWNER' | 'EDITOR', createdBy: number | null) {
  const client = db();
  if (!client) return null;
  const result = await client.execute(
    sql`INSERT INTO admin_users (email, password_hash, role, created_by)
        VALUES (${email.toLowerCase()}, ${passwordHash}, ${role}, ${createdBy})
        RETURNING id`,
  );
  return Number((result.rows[0] as { id: number }).id);
}

export async function listAdmins() {
  return safeRows<{ id: number; email: string; role: string; isActive: boolean; createdAt: string }>(
    sql`SELECT id, email, role, is_active AS "isActive", created_at AS "createdAt"
        FROM admin_users ORDER BY id ASC`,
  );
}

export async function updateAdmin(id: number, fields: { role?: string; isActive?: boolean }) {
  const client = db();
  if (!client) return false;
  if (fields.role) {
    await client.execute(sql`UPDATE admin_users SET role = ${fields.role} WHERE id = ${id}`);
  }
  if (typeof fields.isActive === 'boolean') {
    await client.execute(sql`UPDATE admin_users SET is_active = ${fields.isActive} WHERE id = ${id}`);
  }
  return true;
}

export async function updateAdminPassword(id: number, passwordHash: string) {
  const client = db();
  if (!client) return false;
  await client.execute(sql`UPDATE admin_users SET password_hash = ${passwordHash} WHERE id = ${id}`);
  return true;
}

export async function updateAdminEmail(id: number, email: string) {
  const client = db();
  if (!client) return false;
  await client.execute(sql`UPDATE admin_users SET email = ${email.toLowerCase()} WHERE id = ${id}`);
  return true;
}

export async function findAdminByEmailExcludingSelf(id: number, email: string) {
  return one<{ id: number }>(
    sql`SELECT id FROM admin_users WHERE lower(email) = lower(${email}) AND id <> ${id} LIMIT 1`
  );
}

/* Sesiones */

export async function insertSession(tokenHash: string, adminId: number, expiresAt: Date, ipHash: string, userAgent: string) {
  const client = db();
  if (!client) return false;
  await client.execute(
    sql`INSERT INTO sessions (token_hash, admin_id, expires_at, ip_hash, user_agent)
        VALUES (${tokenHash}, ${adminId}, ${expiresAt}, ${ipHash}, ${userAgent.slice(0, 400)})`,
  );
  return true;
}

export async function findSession(tokenHash: string) {
  return one<{ id: number; adminId: number; expiresAt: Date; role: string; email: string; isActive: boolean }>(
    sql`SELECT s.id, s.admin_id AS "adminId", s.expires_at AS "expiresAt",
               a.role, a.email, a.is_active AS "isActive"
        FROM sessions s JOIN admin_users a ON a.id = s.admin_id
        WHERE s.token_hash = ${tokenHash} AND s.expires_at > now() LIMIT 1`,
  );
}

export async function deleteSession(tokenHash: string) {
  const client = db();
  if (!client) return false;
  await client.execute(sql`DELETE FROM sessions WHERE token_hash = ${tokenHash}`);
  return true;
}

export async function purgeExpiredSessions() {
  const client = db();
  if (!client) return false;
  await client.execute(sql`DELETE FROM sessions WHERE expires_at < now()`);
  return true;
}

export async function writeAudit(actorId: number | null, action: string, entity: string, entityId: string, diff: unknown) {
  const client = db();
  if (!client) return;
  try {
    await client.execute(
      sql`INSERT INTO audit_log (actor_id, action, entity, entity_id, diff)
          VALUES (${actorId}, ${action}, ${entity}, ${entityId}, ${JSON.stringify(diff)}::jsonb)`,
    );
  } catch {
    /* la auditoría no debe romper la operación principal */
  }
}

/* Productos (admin) */

export async function listProductsAdmin() {
  return safeRows<{
    id: number;
    brand: string;
    model: string;
    condition: string;
    priceCents: number;
    availability: string;
    isActive: boolean;
    isFeatured: boolean;
    sku: string;
    name: string;
    slug: string;
    images: number;
  }>(
    sql`SELECT p.id, p.brand, p.model, p.condition, p.price_cents AS "priceCents",
               p.availability, p.is_active AS "isActive", p.is_featured AS "isFeatured", p.sku,
               COALESCE(t.name, p.model) AS name, COALESCE(t.slug, '') AS slug,
               (SELECT COUNT(*)::int FROM product_images i WHERE i.product_id = p.id) AS images
        FROM products p
        LEFT JOIN product_translations t ON t.product_id = p.id AND t.locale = 'es'
        ORDER BY p.created_at DESC`,
  );
}

export type ProductAdmin = {
  id: number;
  categoryId: number | null;
  brand: string;
  model: string;
  condition: string;
  priceCents: number;
  compareAtCents: number | null;
  sku: string;
  availability: string;
  isActive: boolean;
  isFeatured: boolean;
  specs: Record<string, string>;
  translations: Row[];
  variants: Row[];
  images: Row[];
};

export async function getProductAdmin(id: number): Promise<ProductAdmin | null> {
  const product = await one<Row>(
    sql`SELECT id, category_id AS "categoryId", brand, model, condition,
               price_cents AS "priceCents", compare_at_cents AS "compareAtCents", sku,
               availability, is_active AS "isActive", is_featured AS "isFeatured", specs
        FROM products WHERE id = ${id} LIMIT 1`,
  );
  if (!product) return null;
  const [translations, variants, images] = await Promise.all([
    safeRows(sql`SELECT locale, slug, name, short_description AS "shortDescription",
                        description_md AS "descriptionMd", seo_title AS "seoTitle",
                        seo_description AS "seoDescription"
                 FROM product_translations WHERE product_id = ${id}`),
    safeRows(sql`SELECT id, sku, attributes, price_cents AS "priceCents",
                        compare_at_cents AS "compareAtCents", availability,
                        image_public_id AS "imagePublicId", label_es AS "labelEs",
                        position
                 FROM product_variants WHERE product_id = ${id} ORDER BY position ASC, id ASC`),
    safeRows(sql`SELECT id, variant_id AS "variantId", cloudinary_public_id AS "cloudinaryPublicId",
                        alt, position, is_primary AS "isPrimary"
                 FROM product_images WHERE product_id = ${id} ORDER BY is_primary DESC, position ASC`),
  ]);
  return { ...product, translations, variants, images } as unknown as ProductAdmin;
}

export type ProductInput = {
  id?: number;
  categoryId: number | null;
  brand: string;
  model: string;
  condition: string;
  priceCents: number;
  compareAtCents: number | null;
  sku: string;
  availability: string;
  isActive: boolean;
  isFeatured: boolean;
  specs: Record<string, string>;
  translations: {
    locale: string;
    slug: string;
    name: string;
    shortDescription: string;
    descriptionMd: string;
    seoTitle: string;
    seoDescription: string;
  }[];
  images: { cloudinaryPublicId: string; alt: string; isPrimary: boolean; position: number }[];
  variants?: {
    sku: string;
    attributes: Record<string, string>;
    priceCents: number | null;
    compareAtCents: number | null;
    availability: string;
    imagePublicId: string | null;
    labelEs: string;
    position: number;
  }[];
};

/** Comprueba que la categoría exista (evita errores de clave foránea). */
export async function categoryExists(id: number): Promise<boolean> {
  const row = await one<{ exists: boolean }>(
    sql`SELECT EXISTS (SELECT 1 FROM categories WHERE id = ${id}) AS exists`,
  );
  return Boolean(row?.exists);
}

/**
 * Indica si un slug ya pertenece a otro producto (en ese idioma).
 * `excludeProductId` permite reutilizar el slug del propio producto al editar.
 */
export async function productSlugInUse(
  locale: string,
  slug: string,
  excludeProductId: number | null = null,
): Promise<boolean> {
  const row = await one<{ exists: boolean }>(
    sql`SELECT EXISTS (
            SELECT 1 FROM product_translations
            WHERE locale = 'es' AND slug = ${slug}
              AND (${excludeProductId}::int IS NULL OR product_id <> ${excludeProductId})
          ) AS exists`,
  );
  return Boolean(row?.exists);
}

/** Igual que `productSlugInUse`, pero para publicaciones. */
export async function postSlugInUse(
  locale: string,
  slug: string,
  excludePostId: number | null = null,
): Promise<boolean> {
  const row = await one<{ exists: boolean }>(
    sql`SELECT EXISTS (
            SELECT 1 FROM post_translations
            WHERE locale = 'es' AND slug = ${slug}
              AND (${excludePostId}::int IS NULL OR post_id <> ${excludePostId})
          ) AS exists`,
  );
  return Boolean(row?.exists);
}

/** Igual que `productSlugInUse`, pero para categorías. */
export async function categorySlugInUse(
  locale: string,
  slug: string,
  excludeCategoryId: number | null = null,
): Promise<boolean> {
  const row = await one<{ exists: boolean }>(
    sql`SELECT EXISTS (
            SELECT 1 FROM category_translations
            WHERE locale = 'es' AND slug = ${slug}
              AND (${excludeCategoryId}::int IS NULL OR category_id <> ${excludeCategoryId})
          ) AS exists`,
  );
  return Boolean(row?.exists);
}

/** Igual que `productSlugInUse`, pero para proyectos. */
export async function projectSlugInUse(
  locale: string,
  slug: string,
  excludeProjectId: number | null = null,
): Promise<boolean> {
  const row = await one<{ exists: boolean }>(
    sql`SELECT EXISTS (
            SELECT 1 FROM project_translations
            WHERE locale = 'es' AND slug = ${slug}
              AND (${excludeProjectId}::int IS NULL OR project_id <> ${excludeProjectId})
          ) AS exists`,
  );
  return Boolean(row?.exists);
}

export async function saveProduct(input: ProductInput): Promise<number | null> {
  const client = db();
  if (!client) return null;

  return client.transaction(async (tx) => {
    let id = input.id ?? 0;

    if (id) {
      await tx.execute(
        sql`UPDATE products SET category_id = ${input.categoryId}, brand = ${input.brand},
                model = ${input.model}, condition = ${input.condition},
                price_cents = ${input.priceCents}, compare_at_cents = ${input.compareAtCents},
                sku = ${input.sku}, availability = ${input.availability},
                is_active = ${input.isActive}, is_featured = ${input.isFeatured},
                specs = ${JSON.stringify(input.specs)}::jsonb, updated_at = now()
            WHERE id = ${id}`,
      );
    } else {
      const result = await tx.execute(
        sql`INSERT INTO products (category_id, brand, model, condition, price_cents,
                compare_at_cents, sku, availability, is_active, is_featured, specs)
            VALUES (${input.categoryId}, ${input.brand}, ${input.model}, ${input.condition},
                ${input.priceCents}, ${input.compareAtCents}, ${input.sku},
                ${input.availability}, ${input.isActive}, ${input.isFeatured},
                ${JSON.stringify(input.specs)}::jsonb)
            RETURNING id`,
      );
      id = Number((result.rows[0] as { id: number }).id);
    }

    for (const tr of input.translations) {
      // Se replaces la traducción de este producto en ese idioma: el slug pudo
      // cambiar. No se usa ON CONFLICT (locale, slug) porque robaría el slug
      // de otro producto (la API ya avisa si el slug está en uso).
      await tx.execute(
        sql`DELETE FROM product_translations WHERE product_id = ${id} AND locale = ${tr.locale}`,
      );
      await tx.execute(
        sql`INSERT INTO product_translations (product_id, locale, slug, name, short_description,
                description_md, seo_title, seo_description)
            VALUES (${id}, ${tr.locale}, ${tr.slug}, ${tr.name}, ${tr.shortDescription},
                ${tr.descriptionMd}, ${tr.seoTitle}, ${tr.seoDescription})`,
      );
    }

    if (input.images.length > 0) {
      await tx.execute(sql`DELETE FROM product_images WHERE product_id = ${id}`);
      for (const image of input.images) {
        await tx.execute(
          sql`INSERT INTO product_images (product_id, cloudinary_public_id, alt, position, is_primary)
              VALUES (${id}, ${image.cloudinaryPublicId}, ${image.alt}, ${image.position}, ${image.isPrimary})`,
        );
      }
    }

    if (input.variants) {
      await tx.execute(sql`DELETE FROM product_variants WHERE product_id = ${id}`);
      for (const variant of input.variants) {
        await tx.execute(
          sql`INSERT INTO product_variants (product_id, sku, attributes, price_cents, compare_at_cents,
                  availability, image_public_id, label_es, position)
              VALUES (${id}, ${variant.sku}, ${JSON.stringify(variant.attributes)}::jsonb,
                  ${variant.priceCents}, ${variant.compareAtCents}, ${variant.availability},
                  ${variant.imagePublicId}, ${variant.labelEs}, ${variant.position})`,
        );
      }
    }

    return id;
  });
}

export async function deleteProduct(id: number): Promise<{ images: string[] }> {
  const client = db();
  if (!client) return { images: [] };
  const images = await safeRows<{ cloudinaryPublicId: string }>(
    sql`SELECT cloudinary_public_id AS "cloudinaryPublicId" FROM product_images WHERE product_id = ${id}`,
  );
  await client.execute(sql`DELETE FROM products WHERE id = ${id}`);
  return { images: images.map((image) => image.cloudinaryPublicId) };
}

/* Categorías (admin) */

export async function listCategoriesAdmin() {
  return safeRows<{
    id: number;
    sortOrder: number;
    imagePublicId: string | null;
    name: string;
    slug: string;
    products: number;
  }>(
    sql`SELECT c.id, c.sort_order AS "sortOrder", c.image_public_id AS "imagePublicId",
               COALESCE(t.name, '') AS name, COALESCE(t.slug, '') AS slug,
               (SELECT COUNT(*)::int FROM products p WHERE p.category_id = c.id) AS products
        FROM categories c
        LEFT JOIN category_translations t ON t.category_id = c.id AND t.locale = 'es'
        ORDER BY c.sort_order ASC, c.id ASC`,
  );
}

export type CategoryAdmin = {
  id: number;
  sortOrder: number;
  imagePublicId: string | null;
  translations: { locale: string; slug: string; name: string; description: string }[];
};

export async function getCategoryAdmin(id: number): Promise<CategoryAdmin | null> {
  const category = await one<Row>(
    sql`SELECT id, sort_order AS "sortOrder", image_public_id AS "imagePublicId" FROM categories WHERE id = ${id}`,
  );
  if (!category) return null;
  const translations = await safeRows(
    sql`SELECT locale, slug, name, description FROM category_translations WHERE category_id = ${id}`,
  );
  return { ...category, translations } as unknown as CategoryAdmin;
}

export async function saveCategory(input: {
  id?: number;
  sortOrder: number;
  imagePublicId: string | null;
  translations: { locale: string; slug: string; name: string; description: string }[];
}): Promise<number | null> {
  const client = db();
  if (!client) return null;
  return client.transaction(async (tx) => {
    let id = input.id ?? 0;
    if (id) {
      await tx.execute(
        sql`UPDATE categories SET sort_order = ${input.sortOrder}, image_public_id = ${input.imagePublicId} WHERE id = ${id}`,
      );
    } else {
      const result = await tx.execute(
        sql`INSERT INTO categories (sort_order, image_public_id) VALUES (${input.sortOrder}, ${input.imagePublicId}) RETURNING id`,
      );
      id = Number((result.rows[0] as { id: number }).id);
    }
    for (const tr of input.translations) {
      // Igual que en productos: se reemplaza la traducción de este registro
      // en ese idioma, sin reasignar el slug de otro.
      await tx.execute(
        sql`DELETE FROM category_translations WHERE category_id = ${id} AND locale = ${tr.locale}`,
      );
      await tx.execute(
        sql`INSERT INTO category_translations (category_id, locale, slug, name, description)
            VALUES (${id}, ${tr.locale}, ${tr.slug}, ${tr.name}, ${tr.description})`,
      );
    }
    return id;
  });
}

export async function deleteCategory(id: number) {
  const client = db();
  if (!client) return false;
  await client.execute(sql`DELETE FROM categories WHERE id = ${id}`);
  return true;
}

/* Promociones (admin) */

export async function listPromotionsAdmin() {
  return safeRows<{
    id: number;
    name: string;
    type: string;
    value: number;
    startsAt: string;
    endsAt: string | null;
    isActive: boolean;
    priority: number;
    badgeEs: string;
    badgeEn: string;
    targets: number;
  }>(
    sql`SELECT p.id, p.name, p.type, p.value, p.starts_at AS "startsAt", p.ends_at AS "endsAt",
               p.is_active AS "isActive", p.priority, p.badge_es AS "badgeEs", p.badge_en AS "badgeEn",
               (SELECT COUNT(*)::int FROM promotion_targets t WHERE t.promotion_id = p.id) AS targets
        FROM promotions p ORDER BY p.priority DESC, p.id DESC`,
  );
}

export type PromotionAdmin = {
  id: number;
  name: string;
  type: string;
  value: number;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
  priority: number;
  badgeEs: string;
  badgeEn: string;
  productIds: number[];
  categoryIds: number[];
};

export async function getPromotionAdmin(id: number): Promise<PromotionAdmin | null> {
  const promotion = await one<Row>(
    sql`SELECT id, name, type, value, starts_at AS "startsAt", ends_at AS "endsAt",
               is_active AS "isActive", priority, badge_es AS "badgeEs", badge_en AS "badgeEn"
        FROM promotions WHERE id = ${id}`,
  );
  if (!promotion) return null;
  const targets = await safeRows(
    sql`SELECT product_id AS "productId", category_id AS "categoryId"
        FROM promotion_targets WHERE promotion_id = ${id}`,
  );
  return {
    ...promotion,
    productIds: targets.filter((row) => row.productId !== null).map((row) => Number(row.productId)),
    categoryIds: targets.filter((row) => row.categoryId !== null).map((row) => Number(row.categoryId)),
  } as unknown as PromotionAdmin;
}

export async function savePromotion(input: {
  id?: number;
  name: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  startsAt: Date;
  endsAt: Date | null;
  isActive: boolean;
  priority: number;
  badgeEs: string;
  badgeEn: string;
  productIds: number[];
  categoryIds: number[];
}): Promise<number | null> {
  const client = db();
  if (!client) return null;
  return client.transaction(async (tx) => {
    let id = input.id ?? 0;
    if (id) {
      await tx.execute(
        sql`UPDATE promotions SET name = ${input.name}, type = ${input.type}, value = ${input.value},
                starts_at = ${input.startsAt}, ends_at = ${input.endsAt}, is_active = ${input.isActive},
                priority = ${input.priority}, badge_es = ${input.badgeEs}, badge_en = ${input.badgeEn}
            WHERE id = ${id}`,
      );
      await tx.execute(sql`DELETE FROM promotion_targets WHERE promotion_id = ${id}`);
    } else {
      const result = await tx.execute(
        sql`INSERT INTO promotions (name, type, value, starts_at, ends_at, is_active, priority, badge_es, badge_en)
            VALUES (${input.name}, ${input.type}, ${input.value}, ${input.startsAt}, ${input.endsAt},
                ${input.isActive}, ${input.priority}, ${input.badgeEs}, ${input.badgeEn}) RETURNING id`,
      );
      id = Number((result.rows[0] as { id: number }).id);
    }
    for (const productId of input.productIds) {
      await tx.execute(
        sql`INSERT INTO promotion_targets (promotion_id, product_id) VALUES (${id}, ${productId})`,
      );
    }
    for (const categoryId of input.categoryIds) {
      await tx.execute(
        sql`INSERT INTO promotion_targets (promotion_id, category_id) VALUES (${id}, ${categoryId})`,
      );
    }
    return id;
  });
}

export async function deletePromotion(id: number) {
  const client = db();
  if (!client) return false;
  await client.execute(sql`DELETE FROM promotions WHERE id = ${id}`);
  return true;
}

/* Proyectos (admin) */

export async function listProjectsAdmin() {
  return safeRows<{
    id: number;
    year: number | null;
    clientName: string;
    clientApproved: boolean;
    isPublished: boolean;
    coverPublicId: string | null;
    sortOrder: number;
    title: string;
    slug: string;
  }>(
    sql`SELECT p.id, p.year, p.client_name AS "clientName", p.client_approved AS "clientApproved",
               p.is_published AS "isPublished", p.cover_public_id AS "coverPublicId", p.sort_order AS "sortOrder",
               COALESCE(t.title, '') AS title, COALESCE(t.slug, '') AS slug
        FROM projects p
        LEFT JOIN project_translations t ON t.project_id = p.id AND t.locale = 'es'
        ORDER BY p.sort_order ASC, p.id DESC`,
  );
}

export type ProjectAdmin = {
  id: number;
  year: number | null;
  clientName: string;
  clientApproved: boolean;
  isPublished: boolean;
  coverPublicId: string | null;
  sortOrder: number;
  services: string[];
  translations: { locale: string; slug: string; title: string; summary: string; descriptionMd: string }[];
  images: { cloudinaryPublicId: string; alt: string; position: number }[];
};

export async function getProjectAdmin(id: number): Promise<ProjectAdmin | null> {
  const project = await one<Row>(
    sql`SELECT id, year, client_name AS "clientName", client_approved AS "clientApproved",
               services, cover_public_id AS "coverPublicId", is_published AS "isPublished", sort_order AS "sortOrder"
        FROM projects WHERE id = ${id} LIMIT 1`,
  );
  if (!project) return null;
  const [translations, images] = await Promise.all([
    safeRows(sql`SELECT locale, slug, title, summary, description_md AS "descriptionMd"
                 FROM project_translations WHERE project_id = ${id}`),
    safeRows(sql`SELECT cloudinary_public_id AS "cloudinaryPublicId", alt, position
                 FROM project_images WHERE project_id = ${id} ORDER BY position ASC`),
  ]);
  return { ...project, translations, images } as unknown as ProjectAdmin;
}

export async function saveProject(input: {
  id?: number;
  year: number | null;
  clientName: string;
  clientApproved: boolean;
  services: string[];
  coverPublicId: string | null;
  isPublished: boolean;
  sortOrder: number;
  translations: { locale: string; slug: string; title: string; summary: string; descriptionMd: string }[];
  images: { cloudinaryPublicId: string; alt: string; position: number }[];
}): Promise<number | null> {
  const client = db();
  if (!client) return null;
  return client.transaction(async (tx) => {
    let id = input.id ?? 0;
    if (id) {
      await tx.execute(
        sql`UPDATE projects SET year = ${input.year}, client_name = ${input.clientName},
                client_approved = ${input.clientApproved}, services = ${textArrayLiteral(input.services)}::text[],
                cover_public_id = ${input.coverPublicId}, is_published = ${input.isPublished},
                sort_order = ${input.sortOrder}, updated_at = now() WHERE id = ${id}`,
      );
    } else {
      const result = await tx.execute(
        sql`INSERT INTO projects (year, client_name, client_approved, services, cover_public_id, is_published, sort_order)
            VALUES (${input.year}, ${input.clientName}, ${input.clientApproved}, ${textArrayLiteral(input.services)}::text[],
                ${input.coverPublicId}, ${input.isPublished}, ${input.sortOrder}) RETURNING id`,
      );
      id = Number((result.rows[0] as { id: number }).id);
    }
    for (const tr of input.translations) {
      // Igual que en productos: se reemplaza la traducción de este registro
      // en ese idioma, sin reasignar el slug de otro.
      await tx.execute(
        sql`DELETE FROM project_translations WHERE project_id = ${id} AND locale = ${tr.locale}`,
      );
      await tx.execute(
        sql`INSERT INTO project_translations (project_id, locale, slug, title, summary, description_md)
            VALUES (${id}, ${tr.locale}, ${tr.slug}, ${tr.title}, ${tr.summary}, ${tr.descriptionMd})`,
      );
    }
    if (input.images.length > 0) {
      await tx.execute(sql`DELETE FROM project_images WHERE project_id = ${id}`);
      for (const image of input.images) {
        await tx.execute(
          sql`INSERT INTO project_images (project_id, cloudinary_public_id, alt, position)
              VALUES (${id}, ${image.cloudinaryPublicId}, ${image.alt}, ${image.position})`,
        );
      }
    }
    return id;
  });
}

export async function deleteProject(id: number) {
  const client = db();
  if (!client) return false;
  await client.execute(sql`DELETE FROM projects WHERE id = ${id}`);
  return true;
}

/* Publicaciones (admin) */

export async function listPostsAdmin() {
  return safeRows<{
    id: number;
    author: string;
    isPublished: boolean;
    publishedAt: string | null;
    coverPublicId: string | null;
    title: string;
    slug: string;
  }>(
    sql`SELECT p.id, p.author, p.is_published AS "isPublished", p.published_at AS "publishedAt",
               p.cover_public_id AS "coverPublicId",
               COALESCE(t.title, '') AS title, COALESCE(t.slug, '') AS slug
        FROM posts p
        LEFT JOIN post_translations t ON t.post_id = p.id AND t.locale = 'es'
        ORDER BY p.published_at DESC NULLS LAST, p.id DESC`,
  );
}

export type PostAdmin = {
  id: number;
  coverPublicId: string | null;
  author: string;
  tags: string[];
  publishedAt: Date | null;
  isPublished: boolean;
  translations: {
    locale: string;
    slug: string;
    title: string;
    excerpt: string;
    bodyMd: string;
  }[];
};

export async function getPostAdmin(id: number): Promise<PostAdmin | null> {
  const post = await one<Row>(
    sql`SELECT id, cover_public_id AS "coverPublicId", author, tags, published_at AS "publishedAt",
               is_published AS "isPublished" FROM posts WHERE id = ${id} LIMIT 1`,
  );
  if (!post) return null;
  const translations = await safeRows(
    sql`SELECT locale, slug, title, excerpt, body_md AS "bodyMd" FROM post_translations WHERE post_id = ${id}`,
  );
  return { ...post, translations } as unknown as PostAdmin;
}

export async function savePost(input: {
  id?: number;
  coverPublicId: string | null;
  author: string;
  tags: string[];
  publishedAt: Date | null;
  isPublished: boolean;
  translations: { locale: string; slug: string; title: string; excerpt: string; bodyMd: string }[];
}): Promise<number | null> {
  const client = db();
  if (!client) return null;
  return client.transaction(async (tx) => {
    let id = input.id ?? 0;
    if (id) {
      await tx.execute(
        sql`UPDATE posts SET cover_public_id = ${input.coverPublicId}, author = ${input.author},
                tags = ${textArrayLiteral(input.tags)}::text[], published_at = ${input.publishedAt},
                is_published = ${input.isPublished}, updated_at = now() WHERE id = ${id}`,
      );
    } else {
      const result = await tx.execute(
        sql`INSERT INTO posts (cover_public_id, author, tags, published_at, is_published)
            VALUES (${input.coverPublicId}, ${input.author}, ${textArrayLiteral(input.tags)}::text[], ${input.publishedAt},
                ${input.isPublished}) RETURNING id`,
      );
      id = Number((result.rows[0] as { id: number }).id);
    }
    for (const tr of input.translations) {
      // Igual que en productos: se reemplaza la traducción de este post en ese
      // idioma para no dejar slugs antiguos ni robar el slug de otro post.
      await tx.execute(
        sql`DELETE FROM post_translations WHERE post_id = ${id} AND locale = ${tr.locale}`,
      );
      await tx.execute(
        sql`INSERT INTO post_translations (post_id, locale, slug, title, excerpt, body_md)
            VALUES (${id}, ${tr.locale}, ${tr.slug}, ${tr.title}, ${tr.excerpt}, ${tr.bodyMd})`,
      );
    }
    return id;
  });
}

export async function deletePost(id: number) {
  const client = db();
  if (!client) return false;
  await client.execute(sql`DELETE FROM posts WHERE id = ${id}`);
  return true;
}

/* ------------------------------------------------------------------ */
/* Paquetes de servicios                                              */
/* ------------------------------------------------------------------ */

/** Paquetes activos con su traducción en el idioma pedido (público). */
export async function listServicePlans(serviceKey?: string) {
  const rows = await safeRows<{
    id: number;
    serviceKey: string;
    priceCents: number;
    currency: string;
    billingPeriod: string;
    deliveryTime: string;
    badge: string;
    isFeatured: boolean;
    sortOrder: number;
    slug: string;
    name: string;
    tagline: string;
    includes: string[];
  }>(
    sql`SELECT p.id, p.service_key AS "serviceKey", p.price_cents AS "priceCents",
               p.currency, p.billing_period AS "billingPeriod",
               p.delivery_time AS "deliveryTime", p.badge,
               p.is_featured AS "isFeatured", p.sort_order AS "sortOrder",
               t.slug, t.name, t.tagline, t.includes
        FROM service_plans p
        JOIN service_plan_translations t ON t.plan_id = p.id AND t.locale = 'es'
        WHERE p.is_active = true
          AND (${serviceKey ?? null}::text IS NULL OR p.service_key = ${serviceKey ?? null})
        ORDER BY p.sort_order ASC, p.id ASC`,
  );
  return rows as unknown as ServicePlan[];
}

/** Paquetes con su traducción en español (panel). */
export async function listServicePlansAdmin() {
  return safeRows<{
    id: number;
    serviceKey: string;
    priceCents: number;
    currency: string;
    billingPeriod: string;
    deliveryTime: string;
    badge: string;
    isActive: boolean;
    isFeatured: boolean;
    sortOrder: number;
    slug: string;
    name: string;
    tagline: string;
    includes: string[];
  }>(
    sql`SELECT p.id, p.service_key AS "serviceKey", p.price_cents AS "priceCents",
               p.currency, p.billing_period AS "billingPeriod",
               p.delivery_time AS "deliveryTime", p.badge,
               p.is_active AS "isActive", p.is_featured AS "isFeatured",
               p.sort_order AS "sortOrder",
               COALESCE(t.slug, '') AS slug, COALESCE(t.name, '') AS name,
               COALESCE(t.tagline, '') AS tagline, COALESCE(t.includes, '{}') AS includes
        FROM service_plans p
        LEFT JOIN service_plan_translations t ON t.plan_id = p.id AND t.locale = 'es'
        ORDER BY p.sort_order ASC, p.id ASC`,
  );
}

export type ServicePlanAdmin = {
  id: number;
  serviceKey: string;
  priceCents: number;
  currency: string;
  billingPeriod: string;
  deliveryTime: string;
  badge: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  translations: {
    locale: string;
    slug: string;
    name: string;
    tagline: string;
    includes: string[];
  }[];
};

export async function getServicePlanAdmin(id: number): Promise<ServicePlanAdmin | null> {
  const plan = await one<Row>(
    sql`SELECT id, service_key AS "serviceKey", price_cents AS "priceCents", currency,
               billing_period AS "billingPeriod", delivery_time AS "deliveryTime", badge,
               is_active AS "isActive", is_featured AS "isFeatured", sort_order AS "sortOrder"
        FROM service_plans WHERE id = ${id} LIMIT 1`,
  );
  if (!plan) return null;
  const translations = await safeRows(
    sql`SELECT locale, slug, name, tagline, includes FROM service_plan_translations WHERE plan_id = ${id}`,
  );
  return { ...plan, translations } as unknown as ServicePlanAdmin;
}

/** Indica si un slug ya pertenece a otro paquete. */
export async function servicePlanSlugInUse(
  locale: string,
  slug: string,
  excludePlanId: number | null = null,
): Promise<boolean> {
  const row = await one<{ exists: boolean }>(
    sql`SELECT EXISTS (
            SELECT 1 FROM service_plan_translations
            WHERE locale = 'es' AND slug = ${slug}
              AND (${excludePlanId}::int IS NULL OR plan_id <> ${excludePlanId})
          ) AS exists`,
  );
  return Boolean(row?.exists);
}

/** Paquete por su slug en español (para crear o actualizar sin duplicar). */
export async function findServicePlanBySlug(slug: string): Promise<number | null> {
  const row = await one<{ id: number }>(
    sql`SELECT plan_id AS id FROM service_plan_translations WHERE locale = 'es' AND slug = ${slug} LIMIT 1`,
  );
  return row ? Number(row.id) : null;
}

export async function saveServicePlan(input: {
  id?: number;
  serviceKey: string;
  priceCents: number;
  currency: string;
  billingPeriod: string;
  deliveryTime: string;
  badge: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  translations: {
    locale: string;
    slug: string;
    name: string;
    tagline: string;
    includes: string[];
  }[];
}): Promise<number | null> {
  const client = db();
  if (!client) return null;

  return client.transaction(async (tx) => {
    let id = input.id ?? 0;

    if (id) {
      await tx.execute(
        sql`UPDATE service_plans SET service_key = ${input.serviceKey},
                price_cents = ${input.priceCents}, currency = ${input.currency},
                billing_period = ${input.billingPeriod}, delivery_time = ${input.deliveryTime},
                badge = ${input.badge}, is_active = ${input.isActive},
                is_featured = ${input.isFeatured}, sort_order = ${input.sortOrder},
                updated_at = now()
            WHERE id = ${id}`,
      );
    } else {
      const result = await tx.execute(
        sql`INSERT INTO service_plans (service_key, price_cents, currency, billing_period,
                delivery_time, badge, is_active, is_featured, sort_order)
            VALUES (${input.serviceKey}, ${input.priceCents}, ${input.currency},
                ${input.billingPeriod}, ${input.deliveryTime}, ${input.badge},
                ${input.isActive}, ${input.isFeatured}, ${input.sortOrder})
            RETURNING id`,
      );
      id = Number((result.rows[0] as { id: number }).id);
    }

    for (const tr of input.translations) {
      await tx.execute(
        sql`DELETE FROM service_plan_translations WHERE plan_id = ${id} AND locale = ${tr.locale}`,
      );
      await tx.execute(
        sql`INSERT INTO service_plan_translations (plan_id, locale, slug, name, tagline, includes)
            VALUES (${id}, ${tr.locale}, ${tr.slug}, ${tr.name}, ${tr.tagline},
                ${textArrayLiteral(tr.includes)}::text[])`,
      );
    }

    return id;
  });
}

export async function deleteServicePlan(id: number) {
  const client = db();
  if (!client) return false;
  await client.execute(sql`DELETE FROM service_plans WHERE id = ${id}`);
  return true;
}

/* Cotizaciones (admin) */

export async function listQuotes(limit = 100) {
  return safeRows<{
    id: number;
    number: string;
    publicToken: string;
    customerName: string;
    phone: string;
    email: string;
    totalCents: number;
    currency: string;
    status: QuoteStatus;
    createdAt: string;
    locale: string;
  }>(
    sql`SELECT id, number, public_token AS "publicToken", customer_name AS "customerName",
               phone, email, total_cents AS "totalCents", currency, status,
               created_at AS "createdAt", locale
        FROM quotes ORDER BY created_at DESC LIMIT ${limit}`,
  );
}

export async function updateQuoteStatus(id: number, status: QuoteStatus) {
  const client = db();
  if (!client) return false;
  await client.execute(sql`UPDATE quotes SET status = ${status} WHERE id = ${id}`);
  return true;
}

export async function countQuotesByStatus() {
  const rows = await safeRows<{ status: string; total: number }>(
    sql`SELECT status, COUNT(*)::int AS total FROM quotes GROUP BY status`,
  );
  return Object.fromEntries(rows.map((row) => [row.status, Number(row.total)]));
}

/* ------------------------------------------------------------------ */
/* Seguimientos del cliente                                            */
/* ------------------------------------------------------------------ */

export type TrackingRow = {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  kind: string;
  title: string;
  reference: string;
  status: string;
  progress: number;
  summary: string;
  eta: string | null;
  publicToken: string;
  createdAt: string;
  updatedAt: string;
};

export type TrackingEventRow = {
  id: number;
  trackingId: number;
  status: string;
  progress: number;
  note: string;
  author: string;
  createdAt: string;
};

const TRACKING_SELECT = `
  SELECT t.id, t.customer_id AS "customerId", c.name AS "customerName", c.email AS "customerEmail",
         t.kind, t.title, t.reference, t.status, t.progress, t.summary,
         t.eta::text AS eta, t.public_token AS "publicToken",
         t.created_at::text AS "createdAt", t.updated_at::text AS "updatedAt"
    FROM service_trackings t
    JOIN customer_accounts c ON c.id = t.customer_id`;

/** Seguimientos de un cliente (vista del panel privado). */
export async function listTrackingsForCustomer(customerId: number): Promise<TrackingRow[]> {
  return safeRows<TrackingRow>(
    sql`${sql.raw(TRACKING_SELECT)}
          WHERE t.customer_id = ${customerId}
          ORDER BY t.updated_at DESC, t.id DESC`,
  );
}

/** Todos los seguimientos (panel de administración). */
export async function listTrackingsAdmin(): Promise<TrackingRow[]> {
  return safeRows<TrackingRow>(
    sql`${sql.raw(TRACKING_SELECT)}
          ORDER BY t.updated_at DESC, t.id DESC`,
  );
}

export async function getTracking(id: number): Promise<TrackingRow | null> {
  return one<TrackingRow>(sql`${sql.raw(TRACKING_SELECT)} WHERE t.id = ${id} LIMIT 1`);
}

export async function getTrackingForCustomer(
  id: number,
  customerId: number,
): Promise<TrackingRow | null> {
  return one<TrackingRow>(
    sql`${sql.raw(TRACKING_SELECT)} WHERE t.id = ${id} AND t.customer_id = ${customerId} LIMIT 1`,
  );
}

/** Seguimiento por token público (para compartir sin cuenta). */
export async function getTrackingByToken(token: string): Promise<TrackingRow | null> {
  return one<TrackingRow>(
    sql`${sql.raw(TRACKING_SELECT)} WHERE t.public_token = ${token} LIMIT 1`,
  );
}

export async function listTrackingEvents(trackingId: number): Promise<TrackingEventRow[]> {
  return safeRows<TrackingEventRow>(
    sql`SELECT id, tracking_id AS "trackingId", status, progress, note, author,
               created_at::text AS "createdAt"
        FROM tracking_events WHERE tracking_id = ${trackingId}
        ORDER BY created_at DESC, id DESC`,
  );
}

/** Crea un seguimiento y su primer evento de historial. */
export async function createTracking(data: {
  customerId: number;
  kind: string;
  title: string;
  reference?: string;
  status: string;
  progress: number;
  summary?: string;
  eta?: string | null;
  publicToken: string;
  note?: string;
}): Promise<number | null> {
  const client = db();
  if (!client) return null;

  return client.transaction(async (tx) => {
    const result = await tx.execute(
      sql`INSERT INTO service_trackings (customer_id, kind, title, reference, status, progress,
                summary, eta, public_token)
            VALUES (${data.customerId}, ${data.kind}, ${data.title}, ${data.reference ?? ''},
                ${data.status}, ${data.progress}, ${data.summary ?? ''}, ${data.eta ?? null},
                ${data.publicToken})
            RETURNING id`,
    );
    const id = Number((result.rows[0] as { id: number }).id);
    await tx.execute(
      sql`INSERT INTO tracking_events (tracking_id, status, progress, note, author)
            VALUES (${id}, ${data.status}, ${data.progress}, ${data.note || 'Seguimiento creado.'}, 'Windytech')`,
    );
    return id;
  });
}

/** Actualiza el seguimiento y deja constancia en el historial. */
export async function updateTracking(
  id: number,
  data: {
    title?: string;
    reference?: string;
    status: string;
    progress: number;
    summary?: string;
    eta?: string | null;
    note?: string;
  },
): Promise<boolean> {
  const client = db();
  if (!client) return false;

  return client.transaction(async (tx) => {
    const result = await tx.execute(
      sql`UPDATE service_trackings
              SET title = COALESCE(${data.title ?? null}, title),
                  reference = COALESCE(${data.reference ?? null}, reference),
                  status = ${data.status},
                  progress = ${data.progress},
                  summary = COALESCE(${data.summary ?? null}, summary),
                  eta = ${data.eta ?? null},
                  updated_at = now()
            WHERE id = ${id}
            RETURNING id`,
    );
    if (result.rows.length === 0) return false;
    await tx.execute(
      sql`INSERT INTO tracking_events (tracking_id, status, progress, note, author)
            VALUES (${id}, ${data.status}, ${data.progress}, ${data.note || 'Estado actualizado.'}, 'Windytech')`,
    );
    return true;
  });
}

export async function deleteTracking(id: number): Promise<boolean> {
  const client = db();
  if (!client) return false;
  const result = await client.execute(sql`DELETE FROM service_trackings WHERE id = ${id} RETURNING id`);
  return result.rows.length > 0;
}

/** Cliente al que pertenece un seguimiento (para crear seguimientos desde el admin). */
export async function findCustomerByEmail(email: string): Promise<{ id: number; name: string } | null> {
  return one<{ id: number; name: string }>(
    sql`SELECT id, name FROM customer_accounts WHERE lower(email) = lower(${email}) LIMIT 1`,
  );
}

/* ------------------------------------------------------------------ */
/* Leads y novedades del cliente                                      */
/* ------------------------------------------------------------------ */

export type LeadRow = {
  id: number;
  name: string;
  business: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  channel: string;
  source: string;
  campaign: string;
  status: string;
  customerId: number | null;
  trackingId: number | null;
  createdAt: string;
  updatedAt: string;
};

export async function createLead(data: {
  name: string;
  business: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  channel: string;
  source: string;
  campaign: string;
  customerId: number | null;
}): Promise<number | null> {
  const client = db();
  if (!client) return null;
  const result = await client.execute(
    sql`INSERT INTO leads (name, business, phone, email, service, message, channel, source,
                campaign, customer_id)
          VALUES (${data.name}, ${data.business}, ${data.phone}, ${data.email}, ${data.service},
                ${data.message}, ${data.channel}, ${data.source}, ${data.campaign}, ${data.customerId})
          RETURNING id`,
  );
  return result.rows.length > 0 ? Number((result.rows[0] as { id: number }).id) : null;
}

export async function listLeads(): Promise<LeadRow[]> {
  return safeRows<LeadRow>(
    sql`SELECT id, name, business, phone, email, service, message, channel, source, campaign,
               status, customer_id AS "customerId", tracking_id AS "trackingId",
               created_at::text AS "createdAt", updated_at::text AS "updatedAt"
        FROM leads ORDER BY created_at DESC, id DESC`,
  );
}

export async function getLead(id: number): Promise<LeadRow | null> {
  return one<LeadRow>(
    sql`SELECT id, name, business, phone, email, service, message, channel, source, campaign,
               status, customer_id AS "customerId", tracking_id AS "trackingId",
               created_at::text AS "createdAt", updated_at::text AS "updatedAt"
        FROM leads WHERE id = ${id} LIMIT 1`,
  );
}

export async function updateLeadStatus(
  id: number,
  status: string,
  trackingId?: number | null,
): Promise<boolean> {
  const client = db();
  if (!client) return false;
  const result = await client.execute(
    sql`UPDATE leads
            SET status = ${status},
                tracking_id = COALESCE(${trackingId ?? null}, tracking_id),
                updated_at = now()
          WHERE id = ${id} RETURNING id`,
  );
  return result.rows.length > 0;
}

export async function deleteLead(id: number): Promise<boolean> {
  const client = db();
  if (!client) return false;
  const result = await client.execute(sql`DELETE FROM leads WHERE id = ${id} RETURNING id`);
  return result.rows.length > 0;
}

/** Recuento del embudo: leads por estado. */
export async function countLeadsByStatus(): Promise<Record<string, number>> {
  const rows = await safeRows<{ status: string; n: number }>(
    sql`SELECT status, COUNT(*)::int AS n FROM leads GROUP BY status`,
  );
  return Object.fromEntries(rows.map((row) => [row.status, Number(row.n)]));
}

export type CustomerNotification = {
  id: number;
  customerId: number;
  trackingId: number | null;
  title: string;
  body: string;
  url: string;
  channel: string;
  readAt: string | null;
  createdAt: string;
};

/** Recuento de seguimientos por estado (embudo). */
export async function countTrackingsByStatus(): Promise<Record<string, number>> {
  const rows = await safeRows<{ status: string; n: number }>(
    sql`SELECT status, COUNT(*)::int AS n FROM service_trackings GROUP BY status`,
  );
  return Object.fromEntries(rows.map((row) => [row.status, Number(row.n)]));
}

/** Novedades pendientes del cliente (insignia del panel). */
export async function listCustomerNotifications(
  customerId: number,
  onlyUnread = false,
): Promise<CustomerNotification[]> {
  return safeRows<CustomerNotification>(
    sql`SELECT id, customer_id AS "customerId", tracking_id AS "trackingId", title, body, url,
               channel, read_at::text AS "readAt", created_at::text AS "createdAt"
        FROM customer_notifications
        WHERE customer_id = ${customerId}
          ${onlyUnread ? sql`AND read_at IS NULL` : sql``}
        ORDER BY created_at DESC, id DESC
        LIMIT 30`,
  );
}

export async function createCustomerNotification(data: {
  customerId: number;
  trackingId: number | null;
  title: string;
  body: string;
  url: string;
  channel: string;
}): Promise<number | null> {
  const client = db();
  if (!client) return null;
  const result = await client.execute(
    sql`INSERT INTO customer_notifications (customer_id, tracking_id, title, body, url, channel)
          VALUES (${data.customerId}, ${data.trackingId}, ${data.title}, ${data.body}, ${data.url},
                ${data.channel})
          RETURNING id`,
  );
  return result.rows.length > 0 ? Number((result.rows[0] as { id: number }).id) : null;
}

export async function markNotificationsRead(customerId: number): Promise<boolean> {
  const client = db();
  if (!client) return false;
  await client.execute(
    sql`UPDATE customer_notifications SET read_at = now() WHERE customer_id = ${customerId} AND read_at IS NULL`,
  );
  return true;
}

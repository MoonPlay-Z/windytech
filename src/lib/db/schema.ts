import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const localeEnum = pgEnum('locale', ['es', 'en']);
export const conditionEnum = pgEnum('product_condition', ['NEW', 'REFURBISHED_A', 'USED']);
export const availabilityEnum = pgEnum('availability', ['IN_STOCK', 'OUT_OF_STOCK', 'PREORDER']);
export const promoTypeEnum = pgEnum('promo_type', ['PERCENT', 'FIXED']);
export const quoteCurrencyEnum = pgEnum('quote_currency', ['USD', 'VES']);
export const quoteStatusEnum = pgEnum('quote_status', [
  'NEW',
  'CONTACTED',
  'QUOTED',
  'CLOSED',
  'LOST',
]);
export const adminRoleEnum = pgEnum('admin_role', ['OWNER', 'EDITOR']);

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  sortOrder: integer('sort_order').notNull().default(0),
  imagePublicId: text('image_public_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const categoryTranslations = pgTable(
  'category_translations',
  {
    id: serial('id').primaryKey(),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    locale: localeEnum('locale').notNull(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
  },
  (table) => [
    uniqueIndex('category_translations_locale_slug_idx').on(table.locale, table.slug),
    index('category_translations_category_idx').on(table.categoryId),
  ],
);

export const products = pgTable(
  'products',
  {
    id: serial('id').primaryKey(),
    categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
    brand: text('brand').notNull().default(''),
    model: text('model').notNull().default(''),
    condition: conditionEnum('condition').notNull().default('NEW'),
    priceCents: integer('price_cents').notNull(),
    compareAtCents: integer('compare_at_cents'),
    sku: text('sku').notNull().default(''),
    availability: availabilityEnum('availability').notNull().default('IN_STOCK'),
    isActive: boolean('is_active').notNull().default(true),
    isFeatured: boolean('is_featured').notNull().default(false),
    specs: jsonb('specs').$type<Record<string, string>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('products_category_idx').on(table.categoryId),
    index('products_active_idx').on(table.isActive),
  ],
);

export const productTranslations = pgTable(
  'product_translations',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    locale: localeEnum('locale').notNull(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    shortDescription: text('short_description').notNull().default(''),
    descriptionMd: text('description_md').notNull().default(''),
    seoTitle: text('seo_title').notNull().default(''),
    seoDescription: text('seo_description').notNull().default(''),
  },
  (table) => [
    uniqueIndex('product_translations_locale_slug_idx').on(table.locale, table.slug),
    index('product_translations_product_idx').on(table.productId),
  ],
);

export const productVariants = pgTable(
  'product_variants',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    sku: text('sku').notNull().default(''),
    attributes: jsonb('attributes').$type<Record<string, string>>().notNull().default({}),
    priceCents: integer('price_cents'),
    compareAtCents: integer('compare_at_cents'),
    availability: availabilityEnum('availability').notNull().default('IN_STOCK'),
    imagePublicId: text('image_public_id'),
    labelEs: text('label_es').notNull().default(''),
    position: integer('position').notNull().default(0),
  },
  (table) => [index('product_variants_product_idx').on(table.productId)],
);

export const productImages = pgTable(
  'product_images',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    variantId: integer('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
    cloudinaryPublicId: text('cloudinary_public_id').notNull(),
    alt: text('alt').notNull().default(''),
    width: integer('width'),
    height: integer('height'),
    format: text('format'),
    position: integer('position').notNull().default(0),
    isPrimary: boolean('is_primary').notNull().default(false),
  },
  (table) => [index('product_images_product_idx').on(table.productId)],
);

export const promotions = pgTable('promotions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: promoTypeEnum('type').notNull(),
  value: integer('value').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull().defaultNow(),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  isActive: boolean('is_active').notNull().default(true),
  badgeEs: text('badge_es').notNull().default(''),
  badgeEn: text('badge_en').notNull().default(''),
  priority: integer('priority').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const promotionTargets = pgTable(
  'promotion_targets',
  {
    id: serial('id').primaryKey(),
    promotionId: integer('promotion_id')
      .notNull()
      .references(() => promotions.id, { onDelete: 'cascade' }),
    productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id').references(() => categories.id, { onDelete: 'cascade' }),
  },
  (table) => [index('promotion_targets_promotion_idx').on(table.promotionId)],
);

export const quotes = pgTable(
  'quotes',
  {
    id: serial('id').primaryKey(),
    number: text('number').unique(),
    publicToken: text('public_token').notNull().unique(),
    customerName: text('customer_name').notNull(),
    phone: text('phone').notNull(),
    email: text('email').notNull().default(''),
    /** Cliente de la cuenta que pidió la cotización (si está registrado). */
    customerId: integer('customer_id').references(() => customerAccounts.id, {
      onDelete: 'set null',
    }),
    notes: text('notes').notNull().default(''),
    locale: localeEnum('locale').notNull().default('es'),
    currency: quoteCurrencyEnum('currency').notNull().default('USD'),
    rateSnapshot: numeric('rate_snapshot', { precision: 14, scale: 4 }),
    rateDate: date('rate_date'),
    subtotalCents: integer('subtotal_cents').notNull(),
    discountCents: integer('discount_cents').notNull().default(0),
    taxCents: integer('tax_cents').notNull().default(0),
    totalCents: integer('total_cents').notNull(),
    totalVesCents: integer('total_ves_cents'),
    status: quoteStatusEnum('status').notNull().default('NEW'),
    validUntil: timestamp('valid_until', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    whatsappSentAt: timestamp('whatsapp_sent_at', { withTimezone: true }),
  },
  (table) => [index('quotes_status_idx').on(table.status)],
);

export const quoteItems = pgTable(
  'quote_items',
  {
    id: serial('id').primaryKey(),
    quoteId: integer('quote_id')
      .notNull()
      .references(() => quotes.id, { onDelete: 'cascade' }),
    productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
    variantId: integer('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
    nameSnapshot: text('name_snapshot').notNull(),
    attributesSnapshot: jsonb('attributes_snapshot')
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    unitPriceCents: integer('unit_price_cents').notNull(),
    quantity: integer('quantity').notNull(),
    lineTotalCents: integer('line_total_cents').notNull(),
  },
  (table) => [index('quote_items_quote_idx').on(table.quoteId)],
);

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  year: integer('year'),
  clientName: text('client_name').notNull().default(''),
  clientApproved: boolean('client_approved').notNull().default(false),
  services: text('services').array().notNull().default([]),
  coverPublicId: text('cover_public_id'),
  isPublished: boolean('is_published').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const projectTranslations = pgTable(
  'project_translations',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    locale: localeEnum('locale').notNull(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    summary: text('summary').notNull().default(''),
    descriptionMd: text('description_md').notNull().default(''),
  },
  (table) => [
    uniqueIndex('project_translations_locale_slug_idx').on(table.locale, table.slug),
    index('project_translations_project_idx').on(table.projectId),
  ],
);

export const projectImages = pgTable(
  'project_images',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    cloudinaryPublicId: text('cloudinary_public_id').notNull(),
    alt: text('alt').notNull().default(''),
    position: integer('position').notNull().default(0),
  },
  (table) => [index('project_images_project_idx').on(table.projectId)],
);

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  coverPublicId: text('cover_public_id'),
  author: text('author').notNull().default('Windytech'),
  tags: text('tags').array().notNull().default([]),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const postTranslations = pgTable(
  'post_translations',
  {
    id: serial('id').primaryKey(),
    postId: integer('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    locale: localeEnum('locale').notNull(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    excerpt: text('excerpt').notNull().default(''),
    bodyMd: text('body_md').notNull().default(''),
  },
  (table) => [
    uniqueIndex('post_translations_locale_slug_idx').on(table.locale, table.slug),
    index('post_translations_post_idx').on(table.postId),
  ],
);

/* Paquetes de servicios (planes que el cliente puede contratar) */
export const servicePlans = pgTable(
  'service_plans',
  {
    id: serial('id').primaryKey(),
    /** Clave del servicio estático relacionado (software, whatsapp, web...). */
    serviceKey: text('service_key').notNull().default(''),
    priceCents: integer('price_cents').notNull().default(0),
    currency: text('currency').notNull().default('USD'),
    /** one_time | monthly | yearly */
    billingPeriod: text('billing_period').notNull().default('one_time'),
    /** Tiempo de aplicación: "2 a 4 semanas". */
    deliveryTime: text('delivery_time').notNull().default(''),
    badge: text('badge').notNull().default(''),
    isActive: boolean('is_active').notNull().default(true),
    isFeatured: boolean('is_featured').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('service_plans_active_idx').on(table.isActive)],
);

export const servicePlanTranslations = pgTable(
  'service_plan_translations',
  {
    id: serial('id').primaryKey(),
    planId: integer('plan_id')
      .notNull()
      .references(() => servicePlans.id, { onDelete: 'cascade' }),
    locale: localeEnum('locale').notNull(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    tagline: text('tagline').notNull().default(''),
    /** Contenido del paquete, una línea por punto. */
    includes: text('includes').array().notNull().default([]),
  },
  (table) => [
    uniqueIndex('service_plan_translations_locale_slug_idx').on(table.locale, table.slug),
    index('service_plan_translations_plan_idx').on(table.planId),
  ],
);

export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  publicId: text('public_id').notNull().unique(),
  url: text('url').notNull(),
  format: text('format').notNull().default(''),
  width: integer('width'),
  height: integer('height'),
  bytes: integer('bytes'),
  folder: text('folder').notNull().default(''),
  alt: text('alt').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const adminUsers = pgTable(
  'admin_users',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: adminRoleEnum('role').notNull().default('EDITOR'),
    isActive: boolean('is_active').notNull().default(true),
    createdBy: integer('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('admin_users_role_idx').on(table.role)],
);

export const sessions = pgTable(
  'sessions',
  {
    id: serial('id').primaryKey(),
    tokenHash: text('token_hash').notNull().unique(),
    adminId: integer('admin_id')
      .notNull()
      .references(() => adminUsers.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ipHash: text('ip_hash').notNull().default(''),
    userAgent: text('user_agent').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('sessions_admin_idx').on(table.adminId)],
);

export const customerAccounts = pgTable(
  'customer_accounts',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
);

export const customerSessions = pgTable(
  'customer_sessions',
  {
    id: serial('id').primaryKey(),
    tokenHash: text('token_hash').notNull().unique(),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customerAccounts.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('customer_sessions_customer_idx').on(table.customerId)],
);

/* Seguimiento que ve el cliente: servicios, suscripciones, proyectos,
   cotizaciones y equipos comprados. */
export const serviceTrackings = pgTable(
  'service_trackings',
  {
    id: serial('id').primaryKey(),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customerAccounts.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull().default('service'),
    title: text('title').notNull(),
    reference: text('reference').notNull().default(''),
    status: text('status').notNull().default('solicitado'),
    progress: integer('progress').notNull().default(0),
    summary: text('summary').notNull().default(''),
    eta: timestamp('eta', { mode: 'date' }),
    publicToken: text('public_token').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('service_trackings_customer_idx').on(table.customerId),
    index('service_trackings_kind_idx').on(table.kind),
  ],
);

/* Leads: consultas recibidas por el formulario de contacto. */
export const leads = pgTable(
  'leads',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    business: text('business').notNull().default(''),
    phone: text('phone').notNull().default(''),
    email: text('email').notNull().default(''),
    service: text('service').notNull().default(''),
    message: text('message').notNull().default(''),
    channel: text('channel').notNull().default('web'),
    source: text('source').notNull().default(''),
    campaign: text('campaign').notNull().default(''),
    status: text('status').notNull().default('new'),
    customerId: integer('customer_id').references(() => customerAccounts.id, {
      onDelete: 'set null',
    }),
    trackingId: integer('tracking_id').references(() => serviceTrackings.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('leads_status_idx').on(table.status),
    index('leads_created_idx').on(table.createdAt),
  ],
);

/* Novedades del cliente: lo que ve como pendiente en su panel. */
export const customerNotifications = pgTable(
  'customer_notifications',
  {
    id: serial('id').primaryKey(),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customerAccounts.id, { onDelete: 'cascade' }),
    trackingId: integer('tracking_id').references(() => serviceTrackings.id, {
      onDelete: 'cascade',
    }),
    title: text('title').notNull(),
    body: text('body').notNull().default(''),
    url: text('url').notNull().default(''),
    channel: text('channel').notNull().default('panel'),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('customer_notifications_customer_idx').on(table.customerId, table.createdAt)],
);

export const trackingEvents = pgTable(
  'tracking_events',
  {
    id: serial('id').primaryKey(),
    trackingId: integer('tracking_id')
      .notNull()
      .references(() => serviceTrackings.id, { onDelete: 'cascade' }),
    status: text('status').notNull(),
    progress: integer('progress').notNull().default(0),
    note: text('note').notNull().default(''),
    author: text('author').notNull().default('Windytech'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('tracking_events_tracking_idx').on(table.trackingId)],
);

export const auditLog = pgTable(
  'audit_log',
  {
    id: serial('id').primaryKey(),
    actorId: integer('actor_id'),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: text('entity_id').notNull().default(''),
    diff: jsonb('diff').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('audit_log_created_idx').on(table.createdAt)],
);

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull().default(''),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const exchangeRates = pgTable(
  'exchange_rates',
  {
    id: serial('id').primaryKey(),
    source: text('source').notNull(),
    rate: numeric('rate', { precision: 14, scale: 4 }).notNull(),
    fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(),
    isManual: boolean('is_manual').notNull().default(false),
  },
  (table) => [index('exchange_rates_fetched_idx').on(table.fetchedAt)],
);

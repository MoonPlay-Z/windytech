import type { PromotionRule, ResolvedPrice } from './pricing';
import { resolvePrice } from './pricing';

export type Locale = 'es' | 'en';
export type Availability = 'IN_STOCK' | 'OUT_OF_STOCK' | 'PREORDER';
export type Condition = 'NEW' | 'REFURBISHED_A' | 'USED';
export type QuoteStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'CLOSED' | 'LOST';

export type CatalogImage = {
  id: number;
  productId: number;
  variantId: number | null;
  cloudinaryPublicId: string;
  alt: string;
  position: number;
  isPrimary: boolean;
};

export type CatalogVariant = {
  id: number;
  productId: number;
  sku: string;
  attributes: Record<string, string>;
  priceCents: number | null;
  compareAtCents: number | null;
  availability: Availability;
  imagePublicId: string | null;
  labelEs: string;
  labelEn: string;
  position: number;
};

export type CatalogProduct = {
  id: number;
  categoryId: number | null;
  brand: string;
  model: string;
  condition: Condition;
  priceCents: number;
  compareAtCents: number | null;
  sku: string;
  availability: Availability;
  isFeatured: boolean;
  specs: Record<string, string>;
  slug: string;
  name: string;
  shortDescription: string;
  descriptionMd?: string;
  seoTitle?: string;
  seoDescription?: string;
  images: CatalogImage[];
  variants: CatalogVariant[];
  rules: PromotionRule[];
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string;
  imagePublicId: string | null;
  productCount: number;
};

export type ProjectSummary = {
  id: number;
  year: number | null;
  clientName: string;
  services: string[];
  coverPublicId: string | null;
  slug: string;
  title: string;
  summary: string;
  descriptionMd?: string;
  images?: { cloudinaryPublicId: string; alt: string; position: number }[];
};

export type PostSummary = {
  id: number;
  coverPublicId: string | null;
  author: string;
  tags: string[];
  publishedAt: string | null;
  slug: string;
  title: string;
  excerpt: string;
  bodyMd?: string;
};

/** Paquete de servicio: contenido, costo y tiempo de aplicación. */
export type ServicePlan = {
  id: number;
  serviceKey: string;
  priceCents: number;
  currency: string;
  billingPeriod: 'one_time' | 'monthly' | 'yearly';
  deliveryTime: string;
  badge: string;
  isFeatured: boolean;
  sortOrder: number;
  slug: string;
  name: string;
  tagline: string;
  includes: string[];
};

export type PublicQuote = {  id: number;
  number: string;
  publicToken: string;
  customerName: string;
  phone: string;
  email: string;
  notes: string;
  locale: string;
  currency: 'USD' | 'VES';
  rateSnapshot: string | null;
  rateDate: string | null;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  totalVesCents: number | null;
  status: QuoteStatus;
  validUntil: string;
  createdAt: string;
  items: {
    nameSnapshot: string;
    attributesSnapshot: Record<string, string>;
    unitPriceCents: number;
    quantity: number;
    lineTotalCents: number;
  }[];
};

/** Precio efectivo de un producto o de una variante concreta. */
export function priceFor(
  product: CatalogProduct,
  variantId: number | null,
  locale: Locale,
  now: Date = new Date(),
): ResolvedPrice {
  const variant = variantId ? product.variants.find((item) => item.id === variantId) : null;
  return resolvePrice(product, variant ?? null, product.rules ?? [], now, locale);
}

export function primaryImage(product: CatalogProduct): CatalogImage | null {
  return (
    product.images.find((image) => image.isPrimary) ??
    product.images[0] ??
    null
  );
}

export function imageForVariant(product: CatalogProduct, variantId: number | null): CatalogImage | null {
  if (variantId) {
    const match = product.images.find((image) => image.variantId === variantId);
    if (match) return match;
    const variant = product.variants.find((item) => item.id === variantId);
    if (variant?.imagePublicId) {
      return {
        id: -1,
        productId: product.id,
        variantId,
        cloudinaryPublicId: variant.imagePublicId,
        alt: product.name,
        position: 0,
        isPrimary: false,
      };
    }
  }
  return primaryImage(product);
}

export const availabilityLabels: Record<Locale, Record<Availability, string>> = {
  es: {
    IN_STOCK: 'Disponible',
    OUT_OF_STOCK: 'Agotado',
    PREORDER: 'Preventa',
  },
  en: {
    IN_STOCK: 'In stock',
    OUT_OF_STOCK: 'Out of stock',
    PREORDER: 'Pre-order',
  },
};

export const conditionLabels: Record<Locale, Record<Condition, string>> = {
  es: {
    NEW: 'Nuevo',
    REFURBISHED_A: 'Reacondicionado Clase A',
    USED: 'Usado',
  },
  en: {
    NEW: 'New',
    REFURBISHED_A: 'Refurbished Grade A',
    USED: 'Used',
  },
};

/** Etiquetas de atributos de variante (RAM, almacenamiento, color...). */
export const attributeLabels: Record<Locale, Record<string, string>> = {
  es: {
    ram: 'RAM',
    storage: 'Almacenamiento',
    color: 'Color',
    size: 'Tamaño',
    processor: 'Procesador',
    gpu: 'Gráfica',
    screen: 'Pantalla',
    keyboard: 'Teclado',
  },
  en: {
    ram: 'RAM',
    storage: 'Storage',
    color: 'Color',
    size: 'Size',
    processor: 'Processor',
    gpu: 'Graphics',
    screen: 'Screen',
    keyboard: 'Keyboard',
  },
};

/** Diccionario de la interfaz del catálogo. */
export const catalogCopy = {
  es: {
    navLabel: 'Catálogo',
    title: 'Catálogo de equipos',
    eyebrow: 'EQUIPOS INFORMÁTICOS',
    intro:
      'Equipos para oficina, estudio y trabajo remoto. Precios en dólares, disponibilidad actualizada y cotización directa por WhatsApp.',
    noTaxNote: 'Precios sin IVA.',
    search: 'Buscar por nombre, marca o modelo',
    allCategories: 'Todas las categorías',
    allConditions: 'Cualquier condición',
    allBrands: 'Todas las marcas',
    filters: 'Filtros',
    clear: 'Limpiar filtros',
    results: 'equipos',
    empty: 'No encontramos equipos con esos filtros.',
    emptyDb:
      'El catálogo se está actualizando. Escríbenos por WhatsApp y te confirmamos disponibilidad y precio.',
    view: 'Ver ficha',
    quote: 'Cotizar',
    addToCart: 'Añadir al carrito',
    added: 'Añadido',
    askAvailability: 'Consultar disponibilidad',
    outOfStock: 'Agotado',
    preorder: 'Preventa',
    specifications: 'Especificaciones',
    variants: 'Opciones disponibles',
    noVariants: 'Configuración única',
    description: 'Descripción',
    backToCatalog: 'Volver al catálogo',
    currency: 'Moneda',
    usd: 'USD',
    ves: 'Bs',
    rateNote: 'Tasa BCV aplicada',
    cart: 'Carrito',
    cartTitle: 'Tu carrito',
    cartEmpty: 'Tu carrito está vacío.',
    cartEmptyCta: 'Ver el catálogo',
    cartItem: 'Producto',
    cartQty: 'Cantidad',
    cartTotal: 'Total',
    remove: 'Quitar',
    subtotal: 'Subtotal',
    discount: 'Descuento',
    total: 'Total',
    noTax: 'Precios sin IVA. El IVA, si aplica, se confirma en la cotización.',
    checkout: 'Solicitar cotización',
    continue: 'Seguir comprando',
    formTitle: 'Datos para la cotización',
    name: 'Nombre y apellido',
    phone: 'Teléfono / WhatsApp',
    email: 'Correo (opcional)',
    notes: 'Notas (opcional)',
    notesPlaceholder: 'Ciudad de entrega, tiempo requerido, detalles...',
    submit: 'Crear cotización',
    submitting: 'Creando cotización...',
    error: 'No se pudo crear la cotización. Intenta de nuevo o escríbenos por WhatsApp.',
    success: 'Cotización creada',
    successText:
      'Guarda este enlace. Al enviarla por WhatsApp, nuestro equipo confirma disponibilidad y forma de pago.',
    sendWhatsapp: 'Enviar por WhatsApp',
    viewQuote: 'Ver cotización',
    quotePage: 'Cotización',
    quoteValid: 'Válida hasta',
    quoteNotPurchase: 'Esta cotización no es una compra. Confirma disponibilidad y pago con nuestro equipo.',
    quoteItems: 'Productos',
    quoteCustomer: 'Datos del cliente',
    quoteStatus: 'Estado',
    quoteExpired: 'Esta cotización está vencida.',
    priceChanged:
      'Actualizamos precios y disponibilidad al crear la cotización. Revisa el resumen antes de enviarla.',
    whatsappIntro: 'Hola Windytech, quiero cotizar',
    cartAdded: 'Producto añadido al carrito.',
    cartRemoved: 'Producto eliminado.',
  },
  en: {
    navLabel: 'Catalog',
    title: 'Equipment catalog',
    eyebrow: 'IT EQUIPMENT',
    intro:
      'Equipment for the office, studio and remote work. USD pricing, current availability and a direct WhatsApp quote.',
    noTaxNote: 'Prices exclude VAT.',
    search: 'Search by name, brand or model',
    allCategories: 'All categories',
    allConditions: 'Any condition',
    allBrands: 'All brands',
    filters: 'Filters',
    clear: 'Clear filters',
    results: 'items',
    empty: 'No equipment matches those filters.',
    emptyDb:
      'The catalog is being updated. Message us on WhatsApp and we will confirm availability and price.',
    view: 'View details',
    quote: 'Quote',
    addToCart: 'Add to cart',
    added: 'Added',
    askAvailability: 'Check availability',
    outOfStock: 'Out of stock',
    preorder: 'Pre-order',
    specifications: 'Specifications',
    variants: 'Available options',
    noVariants: 'Single configuration',
    description: 'Description',
    backToCatalog: 'Back to catalog',
    currency: 'Currency',
    usd: 'USD',
    ves: 'Bs',
    rateNote: 'BCV rate applied',
    cart: 'Cart',
    cartTitle: 'Your cart',
    cartEmpty: 'Your cart is empty.',
    cartEmptyCta: 'Browse the catalog',
    cartItem: 'Product',
    cartQty: 'Quantity',
    cartTotal: 'Total',
    remove: 'Remove',
    subtotal: 'Subtotal',
    discount: 'Discount',
    total: 'Total',
    noTax: 'Prices exclude VAT. Any applicable VAT is confirmed in the quote.',
    checkout: 'Request a quote',
    continue: 'Keep shopping',
    formTitle: 'Quote details',
    name: 'Full name',
    phone: 'Phone / WhatsApp',
    email: 'Email (optional)',
    notes: 'Notes (optional)',
    notesPlaceholder: 'Delivery city, timeline, details...',
    submit: 'Create quote',
    submitting: 'Creating quote...',
    error: 'We could not create the quote. Try again or message us on WhatsApp.',
    success: 'Quote created',
    successText:
      'Save this link. When you send it on WhatsApp, our team confirms availability and payment method.',
    sendWhatsapp: 'Send on WhatsApp',
    viewQuote: 'View quote',
    quotePage: 'Quote',
    quoteValid: 'Valid until',
    quoteNotPurchase: 'This quote is not a purchase. Confirm availability and payment with our team.',
    quoteItems: 'Items',
    quoteCustomer: 'Customer details',
    quoteStatus: 'Status',
    quoteExpired: 'This quote has expired.',
    priceChanged: 'Prices and availability are recalculated when the quote is created. Review the summary.',
    whatsappIntro: 'Hello Windytech, I would like a quote for',
    cartAdded: 'Product added to cart.',
    cartRemoved: 'Product removed.',
  },
} as const;

export const categoryPath = (locale: Locale) => (locale === 'es' ? '/catalogo/' : '/en/catalog/');
export const cartPath = (locale: Locale) => (locale === 'es' ? '/carrito/' : '/en/cart/');
export const quotePath = (locale: Locale, token: string) =>
  locale === 'es' ? `/cotizacion/${token}/` : `/en/quote/${token}/`;
export const projectsPath = (locale: Locale) => (locale === 'es' ? '/proyectos/' : '/en/projects/');
export const blogPath = (locale: Locale) => (locale === 'es' ? '/blog/' : '/en/blog/');

import { z } from 'zod';

/**
 * Convierte los errores de Zod en mensajes legibles en español, agrupados
 * por campo, para mostrarlos en el panel sin jerga técnica.
 */
export function fieldErrors(error: z.ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : 'formulario';
    const list = (fields[key] ??= []);
    const message = translateIssue(issue);
    if (!list.includes(message)) list.push(message);
  }

  return fields;
}

function translateIssue(issue: z.core.$ZodIssue): string {
  switch (issue.code) {
    case 'invalid_type':
      if (issue.input === undefined || issue.input === null) {
        return 'Este campo es obligatorio.';
      }
      return 'Tipo de valor no válido.';
    case 'invalid_format':
      if (issue.format === 'email') return 'Escribe un correo válido.';
      return issue.message;
    case 'invalid_value':
      return 'Valor no válido.';
    case 'invalid_union':
      return 'Valor no válido.';
    case 'too_small':
      if (issue.minimum === 1) return 'Este campo es obligatorio.';
      return `El valor mínimo es ${issue.minimum}.`;
    case 'too_big':
      return `El valor máximo es ${issue.maximum}.`;
    default:
      return issue.message || 'Valor no válido.';
  }
}

const slug = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido: usa minúsculas, números y guiones.');

export const quoteItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  variantId: z.coerce.number().int().positive().nullable().optional(),
  quantity: z.coerce.number().int().min(1).max(20),
});

export const quoteSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .min(6)
    .max(40)
    .regex(/^[+\d\s().-]+$/, 'Teléfono inválido.'),
  email: z.union([z.string().trim().email(), z.literal('')]).default(''),
  notes: z.string().trim().max(1500).default(''),
  locale: z.enum(['es', 'en']).default('es'),
  currency: z.enum(['USD', 'VES']).default('USD'),
  items: z.array(quoteItemSchema).min(1).max(30),
  website: z.string().max(0).optional(), // honeypot
  elapsedMs: z.coerce.number().int().nonnegative().optional(),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

const translation = z.object({
  locale: z.enum(['es', 'en']),
  slug,
  name: z.string().trim().min(2).max(180),
});

export const productSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().nullable().optional(),
  brand: z.string().trim().max(120).default(''),
  model: z.string().trim().max(180).default(''),
  condition: z.enum(['NEW', 'REFURBISHED_A', 'USED']).default('NEW'),
  price: z.coerce.number().min(0).max(1_000_000),
  compareAt: z.coerce.number().min(0).max(1_000_000).nullable().optional(),
  sku: z.string().trim().max(80).default(''),
  availability: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'PREORDER']).default('IN_STOCK'),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  specs: z.record(z.string(), z.string()).default({}),
  translations: z.array(
    translation.extend({
      shortDescription: z.string().trim().max(400).default(''),
      descriptionMd: z.string().trim().max(20_000).default(''),
      seoTitle: z.string().trim().max(200).default(''),
      seoDescription: z.string().trim().max(320).default(''),
    }),
  ).min(1),
  images: z
    .array(
      z.object({
        cloudinaryPublicId: z.string().trim().min(1).max(300),
        alt: z.string().trim().min(2).max(200),
        isPrimary: z.boolean().default(false),
        position: z.coerce.number().int().min(0).default(0),
      }),
    )
    .default([]),
  variants: z
    .array(
      z.object({
        id: z.coerce.number().int().positive().optional(),
        sku: z.string().trim().max(80).default(''),
        attributes: z.record(z.string(), z.string()).default({}),
        price: z.coerce.number().min(0).max(1_000_000).nullable().optional(),
        compareAt: z.coerce.number().min(0).max(1_000_000).nullable().optional(),
        availability: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'PREORDER']).default('IN_STOCK'),
        imagePublicId: z.string().trim().max(300).nullable().optional(),
        labelEs: z.string().trim().max(120).default(''),
        labelEn: z.string().trim().max(120).default(''),
        position: z.coerce.number().int().min(0).default(0),
      }),
    )
    .optional(),
});

export const categorySchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  imagePublicId: z.string().trim().max(300).nullable().optional(),
  translations: z.array(
    z.object({
      locale: z.enum(['es', 'en']),
      slug,
      name: z.string().trim().min(2).max(120),
      description: z.string().trim().max(600).default(''),
    }),
  ).min(1),
});

export const promotionSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(2).max(120),
  type: z.enum(['PERCENT', 'FIXED']),
  value: z.coerce.number().min(0).max(100_000),
  startsAt: z.string().trim().min(1),
  endsAt: z.string().trim().optional(),
  isActive: z.coerce.boolean().default(true),
  priority: z.coerce.number().int().min(0).max(1000).default(0),
  badgeEs: z.string().trim().max(80).default(''),
  badgeEn: z.string().trim().max(80).default(''),
  productIds: z.array(z.coerce.number().int().positive()).default([]),
  categoryIds: z.array(z.coerce.number().int().positive()).default([]),
});

export const projectSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  year: z.coerce.number().int().min(2000).max(2100).nullable().optional(),
  clientName: z.string().trim().max(160).default(''),
  clientApproved: z.coerce.boolean().default(false),
  services: z.array(z.string().trim().max(120)).default([]),
  coverPublicId: z.string().trim().max(300).nullable().optional(),
  isPublished: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).default(0),
  translations: z.array(
    z.object({
      locale: z.enum(['es', 'en']),
      slug,
      title: z.string().trim().min(2).max(180),
      summary: z.string().trim().max(600).default(''),
      descriptionMd: z.string().trim().max(20_000).default(''),
    }),
  ).min(1),
  images: z
    .array(
      z.object({
        cloudinaryPublicId: z.string().trim().min(1).max(300),
        alt: z.string().trim().min(2).max(200),
        position: z.coerce.number().int().min(0).default(0),
      }),
    )
    .default([]),
});

export const postSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  coverPublicId: z.string().trim().max(300).nullable().optional(),
  author: z.string().trim().max(120).default('Windytech'),
  tags: z.array(z.string().trim().max(60)).default([]),
  publishedAt: z.string().trim().optional(),
  isPublished: z.coerce.boolean().default(false),
  translations: z.array(
    z.object({
      locale: z.enum(['es', 'en']),
      slug,
      title: z.string().trim().min(2).max(180),
      excerpt: z.string().trim().max(600).default(''),
      bodyMd: z.string().trim().max(50_000).default(''),
    }),
  ).min(1),
});

export const servicePlanSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  serviceKey: z.string().trim().max(60).default(''),
  price: z.coerce.number().min(0).max(1_000_000),
  currency: z.enum(['USD', 'VES']).default('USD'),
  billingPeriod: z.enum(['one_time', 'monthly', 'yearly']).default('one_time'),
  deliveryTime: z.string().trim().max(120).default(''),
  badge: z.string().trim().max(80).default(''),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).default(0),
  translations: z
    .array(
      z.object({
        locale: z.enum(['es', 'en']),
        slug,
        name: z.string().trim().min(2).max(120),
        tagline: z.string().trim().max(300).default(''),
        includes: z.array(z.string().trim().min(2).max(300)).max(30).default([]),
      }),
    )
    .min(1),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(200),
});

const customerPasswordSchema = z
  .string()
  .min(8)
  .max(72)
  .refine((value) => new TextEncoder().encode(value).length <= 72);

export const customerLoginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: customerPasswordSchema,
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  password: customerPasswordSchema,
});

export const customerProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
});

export const customerChangePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: customerPasswordSchema,
});

/** Convierte dólares del formulario a centavos enteros. */
export function dollarsToCents(value: number): number {
  return Math.round(value * 100);
}

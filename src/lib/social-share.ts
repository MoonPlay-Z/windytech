import { z } from 'zod';
import { company } from '../data/empresa';
import { site } from '../data/site';
import {
  getSocialShareCard,
  listSocialShareCards,
  type SocialShareCardRecord,
} from './db/queries';

/**
 * Tarjetas para compartir en WhatsApp, Facebook, X, LinkedIn y Telegram.
 *
 * Hay una tarjeta global y, opcionalmente, una por producto y por cada
 * página de /servicios/.... La tarjeta se dibuja en el navegador y se guarda
 * como JPEG en Cloudinary; aquí solo se guarda su configuración.
 */

export type SocialShareEntityType = 'global' | 'product' | 'service';
export type SocialShareFormat = 'landscape' | 'square';

export type SocialShareConfig = {
  enabled: boolean;
  companyName: string;
  message: string;
  subtitle: string;
  backgroundColor: string;
  /** Vacío = el color se elige automáticamente según el contraste. */
  textColor: string;
  format: SocialShareFormat;
  /** Altura del logo como porcentaje de la altura de la tarjeta. */
  logoSize: number;
  logoPublicId: string | null;
  backgroundPublicId: string | null;
  /** JPEG generado desde el panel. */
  imagePublicId: string | null;
  imageWidth: number;
  imageHeight: number;
};

export const SOCIAL_SHARE_FORMATS: Record<
  SocialShareFormat,
  { width: number; height: number }
> = {
  landscape: { width: 1200, height: 630 },
  square: { width: 1080, height: 1080 },
};

const HEX = /^#[0-9a-f]{6}$/i;
const CACHE_MS = 60_000;

function firstSentence(text: string, max = 180): string {
  const sentence = text.split(/(?<=\.)\s/)[0] ?? text;
  return sentence.length > max ? `${sentence.slice(0, max - 1).trim()}…` : sentence;
}

export function defaultSocialShareConfig(): SocialShareConfig {
  return {
    enabled: false,
    companyName: site.name,
    message: company.slogan,
    subtitle: firstSentence(company.description),
    backgroundColor: '#0e2234',
    textColor: '',
    format: 'landscape',
    logoSize: 22,
    logoPublicId: null,
    backgroundPublicId: null,
    imagePublicId: null,
    imageWidth: SOCIAL_SHARE_FORMATS.landscape.width,
    imageHeight: SOCIAL_SHARE_FORMATS.landscape.height,
  };
}

const hexColor = z
  .string()
  .trim()
  .regex(HEX, 'Usa un color HEX de 6 dígitos, por ejemplo #0e2234.');

const publicId = z.union([z.string().trim().max(300), z.null()]).default(null);

export const socialShareConfigSchema = z.object({
  enabled: z.boolean().default(false),
  companyName: z
    .string()
    .trim()
    .min(1, 'Escribe el nombre de la empresa.')
    .max(60, 'El nombre de la empresa admite hasta 60 caracteres.'),
  message: z.string().trim().max(140, 'El mensaje principal admite hasta 140 caracteres.').default(''),
  subtitle: z
    .string()
    .trim()
    .max(220, 'El mensaje personalizado admite hasta 220 caracteres.')
    .default(''),
  backgroundColor: hexColor,
  textColor: z.union([z.literal(''), hexColor]).default(''),
  format: z.enum(['landscape', 'square']).default('landscape'),
  logoSize: z.coerce
    .number()
    .int()
    .min(8, 'El logo debe ocupar al menos un 8 % del alto.')
    .max(60, 'El logo no puede ocupar más del 60 % del alto.')
    .default(22),
  logoPublicId: publicId,
  backgroundPublicId: publicId,
  imagePublicId: publicId,
  imageWidth: z.coerce.number().int().min(100).max(4000).default(1200),
  imageHeight: z.coerce.number().int().min(100).max(4000).default(630),
});

export const socialSharePayloadSchema = z.object({
  entityType: z.enum(['global', 'product', 'service']),
  entityId: z.string().trim().max(120).default(''),
  config: socialShareConfigSchema,
});

function text(value: unknown, fallback: string, max: number): string {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, max);
}

function color(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX.test(value) ? value : fallback;
}

function id(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 300) : null;
}

function size(value: unknown, fallback: number, min: number, max: number): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

/**
 * Normaliza una configuración guardada. Tolera configuraciones viejas o
 * incompletas sin romper el sitio: cada campo cae a su valor por defecto.
 */
export function coerceSocialShareConfig(
  raw: unknown,
  base: SocialShareConfig = defaultSocialShareConfig(),
): SocialShareConfig {
  if (!raw || typeof raw !== 'object') return base;
  const value = raw as Record<string, unknown>;
  const format: SocialShareFormat = value.format === 'square' ? 'square' : 'landscape';
  const dimensions = SOCIAL_SHARE_FORMATS[format];
  const autoText = typeof value.textColor === 'string' && HEX.test(value.textColor);
  const imageWidth = size(value.imageWidth, dimensions.width, 100, 4000);
  const imageHeight = size(value.imageHeight, dimensions.height, 100, 4000);

  return {
    enabled: typeof value.enabled === 'boolean' ? value.enabled : base.enabled,
    companyName: text(value.companyName, base.companyName, 60) || base.companyName,
    message: text(value.message, base.message, 140),
    subtitle: text(value.subtitle, base.subtitle, 220),
    backgroundColor: color(value.backgroundColor, base.backgroundColor),
    textColor: autoText ? (value.textColor as string).toLowerCase() : '',
    format,
    logoSize: size(value.logoSize, base.logoSize, 8, 60),
    logoPublicId: id(value.logoPublicId),
    backgroundPublicId: id(value.backgroundPublicId),
    imagePublicId: id(value.imagePublicId),
    imageWidth,
    imageHeight,
  };
}

/* Caché en memoria: una consulta por minuto como máximo. */
let cached: { at: number; rows: SocialShareCardRecord[] } | null = null;

async function cards(): Promise<SocialShareCardRecord[]> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.rows;
  const rows = await listSocialShareCards();
  cached = { at: Date.now(), rows };
  return rows;
}

function findCard(
  rows: SocialShareCardRecord[],
  type: SocialShareEntityType,
  entityId: string,
): SocialShareCardRecord | null {
  return (
    rows.find((row) => row.entityType === type && (row.entityId ?? '') === entityId) ?? null
  );
}

export function invalidateSocialShareCache(): void {
  cached = null;
}

export type SocialShareCardState = {
  config: SocialShareConfig;
  exists: boolean;
  updatedAt: string | null;
};

export async function getSocialShareOverride(
  type: SocialShareEntityType,
  entityId = '',
): Promise<SocialShareCardState> {
  const row = findCard(await cards(), type, entityId);
  return row
    ? {
        config: coerceSocialShareConfig(row.config),
        exists: true,
        updatedAt: row.updatedAt,
      }
    : {
        config: defaultSocialShareConfig(),
        exists: false,
        updatedAt: null,
      };
}

export async function getGlobalSocialShare(): Promise<SocialShareCardState> {
  return getSocialShareOverride('global', '');
}

/**
 * Tarjeta que debe usar una página.
 *
 * - global: solo si la tarjeta global está activa.
 * - product: su tarjeta, o la global si se pide el respaldo (producto sin foto).
 * - service: su tarjeta o la global.
 */
export async function getSocialShareForPage(
  type: SocialShareEntityType,
  entityId = '',
  options: { fallbackToGlobal?: boolean } = {},
): Promise<SocialShareConfig | null> {
  const { fallbackToGlobal = true } = options;

  if (type === 'global') {
    const global = await getGlobalSocialShare();
    return global.config.enabled ? global.config : null;
  }

  const own = await getSocialShareOverride(type, entityId);
  if (own.exists && own.config.enabled) return own.config;
  if (!fallbackToGlobal) return null;

  const global = await getGlobalSocialShare();
  return global.config.enabled ? global.config : null;
}

/** Ids con tarjeta propia, para marcar los listados del panel. */
export async function listSocialShareEntityIds(
  type: 'product' | 'service',
): Promise<Set<string>> {
  const rows = await cards();
  return new Set(
    rows
      .filter((row) => row.entityType === type && row.entityId)
      .map((row) => row.entityId),
  );
}

/** Configuración con la que empieza el editor de una tarjeta específica. */
export function inheritedSocialShareConfig(
  global: SocialShareConfig,
  defaults: { message: string; subtitle: string },
): SocialShareConfig {
  return {
    ...global,
    enabled: true,
    message: defaults.message.slice(0, 140),
    subtitle: defaults.subtitle.slice(0, 220),
    imagePublicId: null,
  };
}

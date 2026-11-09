import { createHash } from 'node:crypto';

/**
 * Construcción de URLs de Cloudinary sin SDK en runtime.
 * Las imágenes se suben firmadas desde el navegador y aquí solo se arman
 * transformaciones y se firma la subida.
 */

const BASE = 'https://res.cloudinary.com';

export function cloudName(): string {
  return (process.env.PUBLIC_CLOUDINARY_CLOUD_NAME ?? '').trim();
}

export type ImageOptions = {
  width?: number;
  height?: number;
  aspectRatio?: string;
  crop?: 'fill' | 'limit' | 'fit';
  gravity?: 'auto' | 'center';
};

function transformation(options: ImageOptions): string {
  const parts = ['f_auto', 'q_auto'];
  if (options.crop) parts.push(`c_${options.crop}`);
  if (options.gravity) parts.push(`g_${options.gravity}`);
  if (options.width) parts.push(`w_${Math.round(options.width)}`);
  if (options.height) parts.push(`h_${Math.round(options.height)}`);
  if (options.aspectRatio) parts.push(`ar_${options.aspectRatio}`);
  return parts.join(',');
}

/** URL de entrega optimizada. Devuelve cadena vacía si no hay publicId. */
export function imageUrl(publicId: string | null | undefined, options: ImageOptions = {}): string {
  const name = cloudName();
  if (!name || !publicId) return '';
  return `${BASE}/${name}/image/upload/${transformation(options)}/${publicId}`;
}

export const PRODUCT_WIDTHS = [400, 800, 1200, 1600] as const;

export function productSrcSet(publicId: string | null | undefined): string {
  if (!publicId) return '';
  return PRODUCT_WIDTHS.map(
    (width) => `${imageUrl(publicId, { width, crop: 'fill', aspectRatio: '4:3', gravity: 'auto' })} ${width}w`,
  ).join(', ');
}

export function productImage(publicId: string | null | undefined, width = 800): string {
  return imageUrl(publicId, { width, crop: 'fill', aspectRatio: '4:3', gravity: 'auto' });
}

export function projectImage(publicId: string | null | undefined, width = 1200): string {
  return imageUrl(publicId, { width, crop: 'fill', aspectRatio: '16:9', gravity: 'auto' });
}

export function ogImage(publicId: string | null | undefined): string {
  return imageUrl(publicId, { width: 1200, height: 630, crop: 'fill', gravity: 'auto' });
}

export type UploadSignature = {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
};

/** Firma parámetros de subida para el widget/API de Cloudinary. */
export function signUpload(folder: string): UploadSignature | null {
  const secret = (process.env.CLOUDINARY_API_SECRET ?? '').trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY ?? '').trim();
  const name = cloudName();
  if (!secret || !apiKey || !name) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  const params = `folder=${folder}&timestamp=${timestamp}${secret}`;
  const signature = createHash('sha1').update(params).digest('hex');
  return { timestamp, signature, apiKey, cloudName: name, folder };
}

/** Borra un asset con la Admin API. Silencioso si faltan credenciales. */
export async function destroyAsset(publicId: string): Promise<boolean> {
  const secret = (process.env.CLOUDINARY_API_SECRET ?? '').trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY ?? '').trim();
  const name = cloudName();
  if (!secret || !apiKey || !name || !publicId) return false;

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${secret}`)
    .digest('hex');

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
  });

  try {
    const response = await fetch(`${BASE}/${name}/image/destroy`, { method: 'POST', body });
    return response.ok;
  } catch {
    return false;
  }
}

export function cloudinaryConfigured(): boolean {
  return Boolean(cloudName() && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

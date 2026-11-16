import { createHash } from 'node:crypto';
import { serverEnv } from './env';

/**
 * Construcción de URLs de Cloudinary sin SDK en runtime.
 * Las imágenes se suben firmadas desde el navegador y aquí solo se arman
 * transformaciones y se firma la subida.
 */

const BASE = 'https://res.cloudinary.com';
const API_BASE = 'https://api.cloudinary.com/v1_1';

/**
 * El nombre del cloud es público (aparece en cada URL de imagen), así que
 * puede tener valor por defecto: si el entorno no lo define, las imágenes ya
 * guardadas en la base siguen mostrándose. Las claves y el secret sí son
 * secretos y deben venir del entorno para poder subir y borrar archivos.
 */
const DEFAULT_CLOUD_NAME = 'cxy5wtgr';

export function cloudName(): string {
  return serverEnv.cloudName || DEFAULT_CLOUD_NAME;
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
  const secret = serverEnv.cloudinarySecret;
  const apiKey = serverEnv.cloudinaryKey;
  const name = cloudName();
  if (!secret || !apiKey || !name) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  const params = `folder=${folder}&timestamp=${timestamp}${secret}`;
  const signature = createHash('sha1').update(params).digest('hex');
  return { timestamp, signature, apiKey, cloudName: name, folder };
}

/** Borra un asset con la Admin API. Silencioso si faltan credenciales. */
export async function destroyAsset(publicId: string): Promise<boolean> {
  const secret = serverEnv.cloudinarySecret;
  const apiKey = serverEnv.cloudinaryKey;
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
    const response = await fetch(`${API_BASE}/${name}/image/destroy`, { method: 'POST', body });
    return response.ok;
  } catch {
    return false;
  }
}

export function cloudinaryConfigured(): boolean {
  return Boolean(cloudName() && serverEnv.cloudinaryKey && serverEnv.cloudinarySecret);
}

export type RemoteUploadResult = {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
};

/**
 * Importa una imagen desde una URL remota (por ejemplo, eBay) al cloud.
 * Cloudinary descarga el archivo y lo guarda con un public_id propio.
 * Devuelve null si faltan credenciales o si la descarga falla.
 */
export async function uploadRemoteImage(
  sourceUrl: string,
  folder: string,
): Promise<RemoteUploadResult | null> {
  const secret = serverEnv.cloudinarySecret;
  const apiKey = serverEnv.cloudinaryKey;
  const name = cloudName();
  if (!secret || !apiKey || !name || !sourceUrl) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${secret}`)
    .digest('hex');

  const body = new URLSearchParams({
    file: sourceUrl,
    folder,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
  });

  try {
    const response = await fetch(`${API_BASE}/${name}/image/upload`, { method: 'POST', body });
    if (!response.ok) {
      const detail = await response.text();
      console.error(
        '[cloudinary] no se pudo importar la imagen:',
        response.status,
        detail.slice(0, 300),
      );
      return null;
    }
    const data = (await response.json()) as {
      public_id?: string;
      secure_url?: string;
      width?: number;
      height?: number;
    };
    if (!data.public_id) return null;
    return {
      publicId: data.public_id,
      secureUrl: data.secure_url ?? '',
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error('[cloudinary] error importando una imagen remota:', error);
    return null;
  }
}

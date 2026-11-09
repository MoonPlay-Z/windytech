import type { APIRoute } from 'astro';
import { productSchema, dollarsToCents } from '../../../lib/validation';
import { deleteProduct, listProductsAdmin, saveProduct, writeAudit } from '../../../lib/db/queries';
import { destroyAsset } from '../../../lib/cloudinary';
import { json, readJson, requireAdmin } from '../../../lib/api';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  return json({ products: await listProductsAdmin() }, 200, { 'Cache-Control': 'no-store' });
};

export const POST: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const parsed = productSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ error: 'Datos inválidos.', fields: parsed.error.flatten().fieldErrors }, 422);
  }

  const data = parsed.data;
  const id = await saveProduct({
    id: data.id,
    categoryId: data.categoryId ?? null,
    brand: data.brand,
    model: data.model,
    condition: data.condition,
    priceCents: dollarsToCents(data.price),
    compareAtCents: data.compareAt ? dollarsToCents(data.compareAt) : null,
    sku: data.sku,
    availability: data.availability,
    isActive: data.isActive,
    isFeatured: data.isFeatured,
    specs: data.specs,
    translations: data.translations,
    images: data.images,
    variants: data.variants?.map((variant) => ({
      sku: variant.sku,
      attributes: variant.attributes,
      priceCents: variant.price != null ? dollarsToCents(variant.price) : null,
      compareAtCents: variant.compareAt != null ? dollarsToCents(variant.compareAt) : null,
      availability: variant.availability,
      imagePublicId: variant.imagePublicId ?? null,
      labelEs: variant.labelEs,
      labelEn: variant.labelEn,
      position: variant.position,
    })),
  });

  if (!id) return json({ error: 'No se pudo guardar el producto.' }, 503);
  await writeAudit(admin.id, data.id ? 'UPDATE' : 'CREATE', 'products', String(id), {
    name: data.translations[0]?.name,
    price: data.price,
  });
  return json({ ok: true, id });
};

export const DELETE: APIRoute = async ({ request, url }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const id = Number(url.searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'Id inválido.' }, 400);

  const { images } = await deleteProduct(id);
  await Promise.allSettled(images.map((publicId) => destroyAsset(publicId)));
  await writeAudit(admin.id, 'DELETE', 'products', String(id), { images: images.length });
  return json({ ok: true, destroyed: images.length });
};

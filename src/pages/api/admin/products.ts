import type { APIRoute } from 'astro';
import { productSchema, dollarsToCents, fieldErrors } from '../../../lib/validation';
import {
  categoryExists,
  deleteProduct,
  listProductsAdmin,
  productSlugInUse,
  saveProduct,
  writeAudit,
} from '../../../lib/db/queries';
import { destroyAsset } from '../../../lib/cloudinary';
import { json, readJson, requireAdmin } from '../../../lib/api';
import { sameOrigin } from '../../../lib/security';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);
  return json({ products: await listProductsAdmin() }, 200, { 'Cache-Control': 'no-store' });
};

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const parsed = productSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ error: 'Datos inválidos.', fields: fieldErrors(parsed.error) }, 422);
  }

  const data = parsed.data;

  // La categoría debe existir: si no, la base devuelve un error 500 opaco.
  if (data.categoryId && !(await categoryExists(data.categoryId))) {
    return json(
      {
        error: 'La categoría seleccionada no existe.',
        fields: { categoryId: ['Elige una categoría de la lista.'] },
      },
      422,
    );
  }

  // El slug es único por idioma: avisa antes de tocar la base de datos.
  for (const translation of data.translations) {
    if (await productSlugInUse(translation.locale, translation.slug, data.id ?? null)) {
      return json(
        {
          error: `El slug "${translation.slug}" ya lo usa otro producto.`,
          fields: { [`translations.${translation.locale}.slug`]: ['Slug duplicado.'] },
        },
        422,
      );
    }
  }

  let id: number | null;
  try {
    id = await saveProduct({
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
        position: variant.position,
      })),
    });
  } catch (error) {
    console.error('[admin] no se pudo guardar el producto:', error);
    return json(
      { error: 'No se pudo guardar el producto. Revisa los datos e inténtalo de nuevo.' },
      500,
    );
  }

  if (!id) return json({ error: 'No se pudo guardar el producto.' }, 503);
  await writeAudit(admin.id, data.id ? 'UPDATE' : 'CREATE', 'products', String(id), {
    name: data.translations[0]?.name,
    price: data.price,
  });
  return json({ ok: true, id });
};

export const DELETE: APIRoute = async ({ request, url }) => {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido.' }, 403);
  const admin = await requireAdmin(request);
  if (!admin) return json({ error: 'No autorizado.' }, 401);

  const id = Number(url.searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'Id inválido.' }, 400);

  const { images } = await deleteProduct(id);
  await Promise.allSettled(images.map((publicId) => destroyAsset(publicId)));
  await writeAudit(admin.id, 'DELETE', 'products', String(id), { images: images.length });
  return json({ ok: true, destroyed: images.length });
};

import type { APIRoute } from 'astro';
import { getProduct } from '../../../lib/db/queries';
import { productJson } from '../../../lib/serialize';
import { currentRate } from '../../../lib/rate';
import { json } from '../../../lib/api';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
    const slug = params.slug ?? '';
  const product = await getProduct(slug);
  if (!product) return json({ error: 'Producto no encontrado.' }, 404);

  const rate = await currentRate();
  return json(
    { product: productJson(product, rate), rate },
    200,
    { 'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' },
  );
};

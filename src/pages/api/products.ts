import type { APIRoute } from 'astro';
import { getCatalog } from '../../lib/db/queries';
import { productJson } from '../../lib/serialize';
import type { Locale } from '../../lib/catalog';
import { currentRate } from '../../lib/rate';
import { json } from '../../lib/api';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const locale = (params.get('locale') === 'en' ? 'en' : 'es') as Locale;

  const products = await getCatalog({
    locale,
    category: params.get('category') ?? undefined,
    condition: params.get('condition') ?? undefined,
    brand: params.get('brand') ?? undefined,
    search: params.get('q') ?? undefined,
    minCents: params.get('min') ? Number(params.get('min')) * 100 : undefined,
    maxCents: params.get('max') ? Number(params.get('max')) * 100 : undefined,
  });

  const rate = await currentRate();
  return json(
    {
      products: products.map((product) => productJson(product, locale, rate)),
      rate,
      currency: params.get('currency') === 'VES' ? 'VES' : 'USD',
    },
    200,
    { 'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' },
  );
};

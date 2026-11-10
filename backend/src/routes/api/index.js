import { getOrNull } from '../../lib/api-client.js';
import { getProductBySlug, listProducts, listCategories, listBrands } from '../../lib/catalog.js';

// These routes are meant to be called from the Astro proxy /api/[...path]
// The api-client uses context.baseUrl to resolve same-origin URLs

export function initApiRoutes(app) {
  // Rate
  app.get('/api/rate', async (req, res) => {
    const rate = await getOrNull('rate'); // would need to expose this
    if (!rate) return res.status(503).json({ error: 'No rate available' });
    res.json({ rate });
  });

  // Catálogo
  app.get('/api/products', async (req, res) => {
    const products = await listProducts({
      locale: req.query.locale,
      promotedOnly: req.query.promoted === 'true',
      category: req.query.category,
      search: req.query.q,
    });
    res.json({ products });
  });

  app.get('/api/products/:slug', async (req, res) => {
    const product = await getProductBySlug(req.params.slug, req.query.locale || 'es');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  });

  // Categorías y marcas
  app.get('/api/categories', async (req, res) => {
    const categories = await listCategories();
    res.json({ categories });
  });

  app.get('/api/brands', async (req, res) => {
    const brands = await listBrands();
    res.json({ brands });
  });

  // Proyectos
  app.get('/api/projects', async (req, res) => {
    // Would query projects table
    res.json({ projects: [] });
  });

  // Posts/blog
  app.get('/api/posts', async (req, res) => {
    // Would query posts table
    res.json({ posts: [] });
  });

  // Cotizaciones
  app.get('/api/quotes', async (req, res) => {
    // Would query quotes table
    res.json({ quotes: [] });
  });
}
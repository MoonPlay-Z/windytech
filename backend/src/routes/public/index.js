import { getProductBySlug, listProducts, listCategories, listBrands } from '../../lib/catalog.js';

export function initPublicRoutes(app) {
  // Catálogo listado
  app.get('/api/public/catalog', async (req, res) => {
    const products = await listProducts({
      locale: req.query.locale,
      promotedOnly: req.query.promoted === 'true',
      category: req.query.category,
      search: req.query.q,
    });
    res.json({ products });
  });

  // Producto detalle
  app.get('/api/public/products/:slug', async (req, res) => {
    const product = await getProductBySlug(req.params.slug, req.query.locale || 'es');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  });

  // Categorías
  app.get('/api/public/categories', async (req, res) => {
    const categories = await listCategories();
    res.json({ categories });
  });

  // Marcas
  app.get('/api/public/brands', async (req, res) => {
    const brands = await listBrands();
    res.json({ brands });
  });
}
import { requireAdmin, requireCustomer, verifyAdmin } from '../middleware/auth.js';
import { query } from '../lib/db/client.js';

// GET /api/admin/me - usuario logueado
export function initAdminRoutes(app) {
  // GET /me - check current session
  app.get('/api/admin/me', (req, res) => {
    if (req.session && req.session.adminId) {
      res.json({ admin: { id: req.session.adminId, authenticated: true } });
    } else {
      res.json({ admin: null, authenticated: false });
    }
  });

  // POST /admin/login - establecer sesión de admin
  app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await db.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
      if (user && user.password_hash === password) { // en producción usar compareSync
        req.session.adminId = user.id;
        res.json({ success: true, admin: { id: user.id, email: user.email } });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // POST /admin/logout - destruir sesión
  app.post('/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
  });

  // CRUD de productos
  initProductRoutes(app);

  // CRUD de categorías
  initCategoryRoutes(app);

  // CRUD de proyectos
  initProjectRoutes(app);

  // CRUD de publicaciones (blog)
  initPostRoutes(app);

  // CRUD de cotizaciones
  initQuoteRoutes(app);

  // CRUD de usuarios (admin)
  initUserRoutes(app);

  // CRUD de clientes
  initCustomerRoutes(app);

  // CRUD de suscripciones
  initSubscriptionRoutes(app);
}

// Product CRUD
function initProductRoutes(app) {
  app.get('/api/admin/products', async (req, res) => {
    const result = await query('SELECT id, slug, name, price_cents, currency, promoted, created_at FROM products ORDER BY created_at DESC');
    res.json({ products: result.rows });
  });

  app.post('/api/admin/products', async (req, res) => {
    const { slug, name, price_cents, currency, category_id, ...rest } = req.body;
    const result = await query(
      `INSERT INTO products (slug, name, price_cents, currency, category_id, rules, images, variants, promoted, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING id, slug, name, price_cents, currency, promoted`,
      [slug, name, price_cents, currency, category_id, JSON.stringify(rules), JSON.stringify(images), JSON.stringify(variants), promoted]
    );
    res.json({ product: result.rows[0] });
  });

  app.patch('/api/admin/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price_cents, currency, category_id, promoted } = req.body;
    await query(
      `UPDATE products SET name = $1, price_cents = $2, currency = $3, category_id = $4, promoted = $5 WHERE id = $6`,
      [name, price_cents, currency, category_id, promoted, id]
    );
    res.json({ success: true });
  });

  app.delete('/api/admin/products/:id', async (req, res) => {
    const { id } = req.params;
    await query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true });
  });
}

// Category CRUD
function initCategoryRoutes(app) {
  app.get('/api/admin/categories', async (req, res) => {
    const result = await query('SELECT * FROM categories ORDER BY name');
    res.json({ categories: result.rows });
  });

  app.post('/api/admin/categories', async (req, res) => {
    const { name, slug } = req.body;
    const result = await query(
      'INSERT INTO categories (name, slug, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [name, slug]
    );
    res.json({ category: result.rows[0] });
  });
}

// Project CRUD
function initProjectRoutes(app) {
  app.get('/api/admin/projects', async (req, res) => {
    const result = await query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json({ projects: result.rows });
  });

  app.post('/api/admin/projects', async (req, res) => {
    const { titulo, descripcion, tecnologia, tecnologias, enlace, imagen, orden } = req.body;
    const result = await query(
      `INSERT INTO projects (titulo, descripcion, tecnologia, tecnologias, enlace, imagen, orden, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [titulo, descripcion, tecnologia, tecnologias, enlace, imagen, orden]
    );
    res.json({ project: result.rows[0] });
  });

  app.patch('/api/admin/projects/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, tecnologia, tecnologias, enlace, imagen,orden } = req.body;
    await query(
      `UPDATE projects SET titulo = $1, descripcion = $2, tecnologia = $3, tecnologias = $4, enlace = $5, imagen = $6, orden = $7 WHERE id = $8`,
      [titulo, descripcion, tecnologia, tecnologias, enlace, imagen, orden, id]
    );
    res.json({ success: true });
  });
}

// Post CRUD
function initPostRoutes(app) {
  app.get('/api/admin/posts', async (req, res) => {
    const result = await query('SELECT * FROM posts ORDER BY created_at DESC');
    res.json({ posts: result.rows });
  });

  app.post('/api/admin/posts', async (req, res) => {
    const { titulo, slug, contenido, resumo, imagen, orden, publicado } = req.body;
    const result = await query(
      'INSERT INTO posts (titulo, slug, contenido, resumo, imagen, orden, publicado, creado_en) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [titulo, slug, contenido, resumo, imagen, orden, publicado]
    );
    res.json({ post: result.rows[0] });
  });
}

// Quote CRUD
function initQuoteRoutes(app) {
  app.get('/api/admin/quotes', async (req, res) => {
    const result = await query('SELECT * FROM quotes ORDER BY created_at DESC');
    res.json({ quotes: result.rows });
  });

  app.patch('/api/admin/quotes', async (req, res) => {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: 'id and status required' });
    }
    await query('UPDATE quotes SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
  });
}

// User CRUD
function initUserRoutes(app) {
  app.get('/api/admin/users', async (req, res) => {
    const result = await query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json({ users: result.rows });
  });

  app.post('/api/admin/users', async (req, res) => {
    const { name, email, password, role } = req.body;
    const result = await query(
      'INSERT INTO users (name, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, name, email, role',
      [name, email, password, role]
    );
    res.json({ user: result.rows[0] });
  });
}

// Customer CRUD
function initCustomerRoutes(app) {
  app.get('/api/admin/customers', async (req, res) => {
    const result = await query('SELECT id, name, email, created_at FROM customers ORDER BY created_at DESC');
    res.json({ customers: result.rows });
  });
}

// Subscription CRUD
function initSubscriptionRoutes(app) {
  app.get('/api/admin/subscriptions', async (req, res) => {
    const result = await query('SELECT * FROM subscriptions ORDER BY created_at DESC');
    res.json({ subscriptions: result.rows });
  });

  app.post('/api/admin/subscriptions', async (req, res) => {
    const { customer_id, plan_id, status, started_at, ended_at } = req.body;
    const result = await query(
      'INSERT INTO subscriptions (customer_id, plan_id, status, started_at, ended_at, creado_en) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [customer_id, plan_id, status, started_at, ended_at]
    );
    res.json({ subscription: result.rows[0] });
  });
}
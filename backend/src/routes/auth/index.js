import bcrypt from 'bcryptjs';
import { db } from '../lib/db/client.js';

export function initAuthRoutes(app) {
  // POST /api/auth/login
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await db.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (passwordMatch) {
        req.session = req.session || {};
        req.session.userId = user.id;
        req.session.userRole = user.role || 'customer';
        res.json({ success: true, user: { id: user.id, email: user.email, role: req.session.userRole } });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // POST /api/auth/register
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.query(
        'INSERT INTO users (name, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, name, email, role',
        [name, email, hashedPassword, 'customer']
      );
      res.json({ success: true, user: { id: result.rows[0].id, email: result.rows[0].email, role: 'customer' } });
    } catch (err) {
      res.status(500).json({ error: 'Email already exists or database error' });
    }
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
  });

  // GET /api/auth/me
  app.get('/api/auth/me', (req, res) => {
    if (req.session && req.session.userId) {
      res.json({ user: { id: req.session.userId, authenticated: true } });
    } else {
      res.json({ user: null, authenticated: false });
    }
  });
}
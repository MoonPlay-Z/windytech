import { db } from '../lib/db/client.js';

export function requireAdmin(req, res, next) {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ error: 'Nonadmin' });
  }
  next();
}

export function requireCustomer(req, res, next) {
  if (!req.session || !req.session.customerId) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  next();
}

// Optional: verify session user exists
export async function verifyAdmin(req, res, next) {
  if (req.session && req.session.adminId) {
    const result = await db.query('SELECT id, email FROM users WHERE id = $1', [req.session.adminId]);
    if (result.rows.length > 0) {
      req.admin = result.rows[0];
    }
  }
  next();
}

export async function verifyCustomer(req, res, next) {
  if (req.session && req.session.customerId) {
    const result = await db.query('SELECT id, name, email FROM customers WHERE id = $1', [req.session.customerId]);
    if (result.rows.length > 0) {
      req.customer = result.rows[0];
    }
  }
  next();
}
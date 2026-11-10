import { requireCustomer } from '../middleware/auth.js';

// Middleware: aplicar requireCustomer a subrutas privadas
export function initCustomerRoutes(app) {
  // GET /api/customer/profile - perfil del cliente (requiere auth)
  app.get('/api/customer/profile', requireCustomer, async (req, res) => {
    // En un setup completo, haríamos un query a la BD
    // Por ahora devolvemos la sesión
    if (req.session && req.session.customerId) {
      res.json({ customer: { id: req.session.customerId, authenticated: true } });
    } else {
      res.status(401).json({ error: 'Unauthenticated' });
    }
  });

  // GET /api/customer/orders - órdenes del cliente
  app.get('/api/customer/orders', requireCustomer, async (req, res) => {
    res.json({ orders: [] }); // query real a BD
  });

  // GET /api/customer/consultations - asesoramientos
  app.get('/api/customer/consultations', requireCustomer, async (req, res) => {
    res.json({ consultations: [] });
  });

  // GET /api/customer/service-requests - solicitudes de servicio
  app.get('/api/customer/service-requests', requireCustomer, async (req, res) => {
    res.json({ requests: [] });
  });

  // GET /api/customer/subscription-plans - planes de suscripción (público)
  app.get('/api/customer/subscription-plans', async (req, res) => {
    res.json({ plans: [] });
  });

  // POST /api/customer/consultations - crear consulta
  app.post('/api/customer/consultations', requireCustomer, async (req, res) => {
    const { titulo, mensaje } = req.body;
    // query a BD para crear consulta
    res.json({ success: true });
  });
}
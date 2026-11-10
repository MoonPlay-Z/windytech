import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import PostgreSQLStore from 'connect-pg-simple';
import { db } from './lib/db/index.js';
import rateLimiter from './lib/rate-limit.js';
import authRoutes from './routes/auth/index.js';
import publicRoutes from './routes/public/index.js';
import apiRoutes from './routes/api/index.js';
import adminRoutes from './routes/admin/index.js';
import customerRoutes from './routes/customer/index.js';

const app = express();
const port = process.env.PORT || 3000;

// Security headers
app.use(helmet());

// CORS - same-origin proxy config
app.use(cors({
  origin: process.env.PUBLIC_SITE_URL || '*',
  credentials: true,
}));

// Trust proxy for session
app.set('trust proxy', 1);

// Session store with PostgreSQL
const PostgreSQLStorePg = PostgreSQLStore(session);
app.use(session({
  store: new PostgreSQLStorePg({ db }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { max age: 24 * 60 * 60 * 1000 } // 1 day
}));

// Rate limiter
app.use(rateLimiter);

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Public API routes (no auth required)
app.use('/api/public', publicRoutes);

// API routes (some protected, some not)
app.use('/api', apiRoutes);

// Admin routes (require admin auth)
app.use('/api/admin', adminRoutes);

// Customer routes (require customer auth)
app.use('/api/customer', customerRoutes);

// Auth routes (login/logout/me/register)
app.use('/api/auth', authRoutes);

// Serve Astro client static files
app.use('/_astro', express.static('dist/client/_astro'));
app.use('/assets', express.static('dist/client/assets'));

// Catch-all: render Astro page for client-side routing
// Serves the Astro client app shell for any non-API route
app.get('*', (req, res) => {
  // Don't override API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  // Send a minimal HTML page that loads the Astro client bundle
  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Windytech — Desarrollo de software y automatización</title>
        <meta name="description" content="Desarrollo de software a medida, automatización de WhatsApp y marketing digital">
        <link rel="icon" href="/favicon.ico">
        <link rel="preload" as="style" href="/assets/css/app.css">
        <link rel="preload" as="script" href="/assets/js/entry.js">
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="/assets/js/entry.js"></script>
      </body>
    </html>
  `;
  res.send(html);
});

// Catch-all 404 for API
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
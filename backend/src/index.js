import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import PostgreSQLStore from 'connect-pg-simple';
import { db } from './lib/db/index.js';
import rateLimiter from './lib/rate-limit.js';

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
import publicRoutes from './routes/public/index.js';
app.use('/api/public', publicRoutes);

// API routes (some protected, some not)
import apiRoutes from './routes/api/index.js';
app.use('/api', apiRoutes);

// Admin routes (require admin auth)
import adminRoutes from './routes/admin/index.js';
app.use('/api/admin', adminRoutes);

// Customer routes (require customer auth)
import customerRoutes from './routes/customer/index.js';
app.use('/api/customer', customerRoutes);

// Auth routes (login/logout)
import authRoutes from './routes/auth/index.js';
app.use('/api/auth', authRoutes);

// Catch-all 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
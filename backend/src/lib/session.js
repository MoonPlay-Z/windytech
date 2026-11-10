import session from 'express-session';
import PostgreSQLStore from 'connect-pg-simple';
import { db } from './db/client.js';

const PostgreSQLStorePg = PostgreSQLStore;

export function initSession(app) {
  app.use(session({
    store: new PostgreSQLStorePg({ db }),
    secret: process.env.SESSION_SECRET || 'change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  }));
}
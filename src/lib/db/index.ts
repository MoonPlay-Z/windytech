import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

const { Pool } = pg;

type GlobalWithDb = typeof globalThis & {
  __wtPool?: pg.Pool;
  __wtDb?: NodePgDatabase<typeof schema>;
};

const globalForDb = globalThis as GlobalWithDb;

export type Database = NodePgDatabase<typeof schema>;

export function databaseUrl(): string {
  // Fuera de Astro (por ejemplo el cron con tsx) no existe import.meta.env.
  const fromAstro = (import.meta as unknown as { env?: Record<string, string> }).env;
  return process.env.DATABASE_URL ?? fromAstro?.DATABASE_URL ?? '';
}

export function hasDatabase(): boolean {
  return databaseUrl().length > 0;
}

export function getPool(): pg.Pool {
  if (!globalForDb.__wtPool) {
    const url = databaseUrl();
    if (!url) throw new Error('DATABASE_URL no está configurada');
    globalForDb.__wtPool = new Pool({
      connectionString: url,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return globalForDb.__wtPool;
}

/**
 * Devuelve el cliente Drizzle o null si no hay DATABASE_URL.
 * Las páginas muestran un estado vacío cuando la base no está configurada.
 */
export function getDb(): Database | null {
  if (!hasDatabase()) return null;
  if (!globalForDb.__wtDb) {
    globalForDb.__wtDb = drizzle(getPool(), { schema });
  }
  return globalForDb.__wtDb;
}

export { schema };

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

export async function close() {
  await pool.end();
}
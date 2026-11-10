import { compare, hash } from 'bcryptjs';
import { sql, eq } from 'drizzle-orm';
import { getDb, schema } from './db';
import { readCookie } from './auth';
import { randomToken, sha256 } from './security';

const CUSTOMER_SESSION_COOKIE = 'wt_customer';
const CUSTOMER_SESSION_DAYS = 30;

export type CustomerSession = {
  id: number;
  name: string;
  email: string;
};

type CustomerCredentials = CustomerSession & { passwordHash: string };

function database() {
  const db = getDb();
  if (!db) throw new Error('Base de datos no configurada');
  return db;
}

export async function registerCustomerAndStartSession(
  name: string,
  email: string,
  password: string,
): Promise<{ user: CustomerSession; token: string; expiresAt: Date }> {
  const passwordHash = await hash(password, 12);
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + CUSTOMER_SESSION_DAYS * 24 * 60 * 60 * 1000);
  const user = await database().transaction(async (tx) => {
    const result = await tx.execute(sql`
      INSERT INTO customer_accounts (name, email, password_hash)
      VALUES (${name}, ${email.toLowerCase()}, ${passwordHash})
      RETURNING id, name, email
    `);
    const customer = result.rows[0] as CustomerSession;
    await tx.execute(sql`
      INSERT INTO customer_sessions (token_hash, customer_id, expires_at)
      VALUES (${sha256(token)}, ${customer.id}, ${expiresAt})
    `);
    return customer;
  });
  return { user, token, expiresAt };
}

export async function authenticateCustomer(
  email: string,
  password: string,
): Promise<CustomerSession | null> {
  const result = await database().execute(sql`
    SELECT id, name, email, password_hash AS "passwordHash"
    FROM customer_accounts
    WHERE email = ${email.toLowerCase()}
  `);
  const customer = result.rows[0] as CustomerCredentials | undefined;
  if (!customer || !(await compare(password, customer.passwordHash))) return null;
  return { id: customer.id, name: customer.name, email: customer.email };
}

export async function startCustomerSession(
  customerId: number,
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + CUSTOMER_SESSION_DAYS * 24 * 60 * 60 * 1000);
  await database().execute(sql`
    INSERT INTO customer_sessions (token_hash, customer_id, expires_at)
    VALUES (${sha256(token)}, ${customerId}, ${expiresAt})
  `);
  return { token, expiresAt };
}

export async function customerSessionFromRequest(
  request: Request,
): Promise<CustomerSession | null> {
  const token = readCookie(request.headers.get('cookie'), CUSTOMER_SESSION_COOKIE);
  if (!token) return null;
  const db = getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT c.id, c.name, c.email
    FROM customer_sessions s
    JOIN customer_accounts c ON c.id = s.customer_id
    WHERE s.token_hash = ${sha256(token)} AND s.expires_at > NOW()
  `);
  return (result.rows[0] as CustomerSession | undefined) ?? null;
}

export async function endCustomerSession(request: Request): Promise<void> {
  const token = readCookie(request.headers.get('cookie'), CUSTOMER_SESSION_COOKIE);
  if (!token) return;
  await database().execute(sql`
    DELETE FROM customer_sessions WHERE token_hash = ${sha256(token)}
  `);
}

export function customerCookieHeader(token: string, expiresAt: Date): string {
  const parts = [
    `${CUSTOMER_SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Expires=${expiresAt.toUTCString()}`,
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

export function clearCustomerCookieHeader(): string {
  const parts = [
    `${CUSTOMER_SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

export async function updateCustomerProfile(
  customerId: number,
  name: string,
  email: string,
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('Base de datos no configurada');
  const existing = await db
    .select()
    .from(schema.customerAccounts)
    .where(eq(schema.customerAccounts.email, email.toLowerCase()))
    .limit(1);
  if (existing.length > 0 && existing[0]!.id !== customerId) {
    const err = new Error('El correo electrónico ya está en uso por otra cuenta.');
    (err as { status?: number }).status = 409;
    throw err;
  }
  await db
    .update(schema.customerAccounts)
    .set({ name, email: email.toLowerCase() })
    .where(eq(schema.customerAccounts.id, customerId));
}

export async function changeCustomerPassword(
  customerId: number,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('Base de datos no configurada');
  const result = await db.execute(sql`
    SELECT password_hash AS "passwordHash"
    FROM customer_accounts
    WHERE id = ${customerId}
    LIMIT 1
  `);
  const row = result.rows[0] as { passwordHash: string } | undefined;
  if (!row || !(await compare(currentPassword, row.passwordHash))) {
    const err = new Error('La contraseña actual es incorrecta.');
    (err as { status?: number }).status = 401;
    throw err;
  }
  const passwordHash = await hash(newPassword, 12);
  await db
    .update(schema.customerAccounts)
    .set({ passwordHash })
    .where(eq(schema.customerAccounts.id, customerId));
}

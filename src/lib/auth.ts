import { compare, hash } from 'bcryptjs';
import { randomToken, sha256 } from './security';
import { SESSION_COOKIE, SESSION_HOURS } from './env';
import {
  deleteSession,
  findAdminByEmail,
  findAdminById,
  findSession,
  insertSession,
  purgeExpiredSessions,
  writeAudit,
} from './db/queries';

export type AdminSession = {
  id: number;
  email: string;
  role: 'OWNER' | 'EDITOR';
};

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  try {
    return await compare(password, passwordHash);
  } catch {
    return false;
  }
}

/** Crea una sesión en base de datos y devuelve el token plano para la cookie. */
export async function startSession(
  adminId: number,
  ip: string,
  userAgent: string,
): Promise<{ token: string; expiresAt: Date } | null> {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  const ok = await insertSession(sha256(token), adminId, expiresAt, sha256(ip), userAgent);
  if (!ok) return null;
  void purgeExpiredSessions();
  return { token, expiresAt };
}

export async function login(
  email: string,
  password: string,
  ip: string,
  userAgent: string,
): Promise<{ token: string; expiresAt: Date; admin: AdminSession } | { error: string }> {
  const admin = await findAdminByEmail(email);
  if (!admin || !admin.isActive) return { error: 'Credenciales incorrectas.' };

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) return { error: 'Credenciales incorrectas.' };

  const session = await startSession(admin.id, ip, userAgent);
  if (!session) return { error: 'No se pudo iniciar sesión. Intenta de nuevo.' };

  await writeAudit(admin.id, 'LOGIN', 'admin_users', String(admin.id), { email: admin.email });
  return { ...session, admin: { id: admin.id, email: admin.email, role: admin.role } };
}

export async function sessionFromToken(token: string | undefined | null): Promise<AdminSession | null> {
  if (!token) return null;
  const row = await findSession(sha256(token));
  if (!row || !row.isActive) return null;
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    await deleteSession(sha256(token));
    return null;
  }
  return { id: row.adminId, email: row.email, role: row.role as 'OWNER' | 'EDITOR' };
}

export async function sessionFromRequest(request: Request): Promise<AdminSession | null> {
  return sessionFromToken(readCookie(request.headers.get('cookie'), SESSION_COOKIE));
}

export async function endSession(request: Request): Promise<void> {
  const token = readCookie(request.headers.get('cookie'), SESSION_COOKIE);
  if (token) await deleteSession(sha256(token));
}

export function cookieHeader(token: string, expiresAt: Date): string {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Expires=${expiresAt.toUTCString()}`,
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

export function clearCookieHeader(): string {
  const parts = [`${SESSION_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) {
      try {
        return decodeURIComponent(rest.join('='));
      } catch {
        return null;
      }
    }
  }
  return null;
}

export async function getAdmin(id: number) {
  return findAdminById(id);
}

import { sessionFromRequest, type AdminSession } from './auth';

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

export function fail(message: string, status = 400, extra: Record<string, unknown> = {}): Response {
  return json({ error: message, ...extra }, status);
}

export async function readJson<T = unknown>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export async function requireAdmin(request: Request): Promise<AdminSession | null> {
  return sessionFromRequest(request);
}

export function requireOwner(session: AdminSession | null): boolean {
  return session?.role === 'OWNER';
}

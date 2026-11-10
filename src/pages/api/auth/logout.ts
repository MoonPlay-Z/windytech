import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async () => {
  // Limpiar la cookie del usuario
  const clearCookie = `
    user_id=;
    Path=/;
    Max-Age=0;
    SameSite=Lax;
  `;

  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': clearCookie,
      },
    }
  );
};
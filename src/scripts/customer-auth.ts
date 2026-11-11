type AuthResponse = {
  user?: { id: number };
  error?: string;
};

function initCustomerAuth() {
  const form = document.querySelector<HTMLFormElement>('[data-auth-form]');
  if (!form || form.dataset.wtBound === 'true') return;
  form.dataset.wtBound = 'true';

  const message = document.querySelector<HTMLElement>('[data-auth-message]');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity() || !button) return;

    if (message) {
      message.hidden = true;
      message.textContent = '';
    }

    button.disabled = true;
    try {
      const payload = Object.fromEntries(new FormData(form).entries());
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as AuthResponse | null;

      if (!response.ok || !data?.user) {
        throw new Error(data?.error || `No se pudo completar la solicitud (${response.status}).`);
      }

      window.location.assign('/cuenta/perfil/');
    } catch (error) {
      if (message) {
        message.textContent =
          error instanceof Error ? error.message : 'No se pudo conectar. Intenta de nuevo.';
        message.hidden = false;
      }
    } finally {
      button.disabled = false;
    }
  });
}

// El botón de cerrar sesión lo gestiona el script del Header (presente en todas
// las páginas), que enlaza todos los elementos [data-logout-button]. Evitamos
// aquí un segundo listener que provocaría dos peticiones de logout.

function bootCustomerAuth() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomerAuth, { once: true });
  } else {
    initCustomerAuth();
  }
  document.addEventListener('astro:page-load', initCustomerAuth);
}

bootCustomerAuth();


type AuthResponse = {
  user?: { id: number };
  error?: string;
};

const form = document.querySelector<HTMLFormElement>('[data-auth-form]');

if (form) {
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
      const data = (await response.json()) as AuthResponse;

      if (!response.ok || !data.user) {
        throw new Error(data.error || 'No se pudo completar la solicitud.');
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

const logoutButton = document.querySelector<HTMLButtonElement>('[data-logout-button]');

if (logoutButton) {
  const message = document.querySelector<HTMLElement>('[data-auth-message]');
  logoutButton.addEventListener('click', async () => {
    logoutButton.disabled = true;
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      const data = (await response.json()) as AuthResponse;
      if (!response.ok) throw new Error(data.error || 'No se pudo cerrar la sesión.');
      window.location.assign('/cuenta/login/');
    } catch (error) {
      if (message) {
        message.textContent =
          error instanceof Error ? error.message : 'No se pudo conectar. Intenta de nuevo.';
        message.hidden = false;
      }
      logoutButton.disabled = false;
    }
  });
}

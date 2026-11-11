function initChangePassword() {
  type ApiResponse = {
    success?: boolean;
    error?: string;
  };

  const form = document.querySelector<HTMLFormElement>('#change-password-form');
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
      const formData = new FormData(form);
      const payload = {
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword'),
      };
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudo cambiar la contraseña.');
      }

      if (message) {
        message.textContent = 'Contraseña actualizada correctamente.';
        message.style.color = '#1e6b5b';
        message.style.background = '#eef7f6';
        message.style.borderColor = '#bfe3e0';
        message.hidden = false;
      }

      button.disabled = false;
      form.reset();
    } catch (error) {
      if (message) {
        message.textContent =
          error instanceof Error ? error.message : 'No se pudo conectar. Intenta de nuevo.';
        message.hidden = false;
      }
      button.disabled = false;
    }
  });
}

function bootChangePassword() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChangePassword, { once: true });
  } else {
    initChangePassword();
  }
  document.addEventListener('astro:page-load', initChangePassword);
}

bootChangePassword();

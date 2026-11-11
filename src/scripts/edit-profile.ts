function initEditProfile() {
  type ApiResponse = {
    success?: boolean;
    user?: { id: number; name: string; email: string };
    error?: string;
  };

  const form = document.querySelector<HTMLFormElement>('#edit-profile-form');
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
        name: formData.get('name'),
        email: formData.get('email'),
      };
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudo actualizar el perfil.');
      }

      if (message) {
        message.textContent = 'Perfil actualizado correctamente.';
        message.style.color = '#1e6b5b';
        message.style.background = '#eef7f6';
        message.style.borderColor = '#bfe3e0';
        message.hidden = false;
      }

      // Pequeña pausa para que el usuario vea el mensaje, luego recarga para mostrar datos actualizados
      setTimeout(() => {
        window.location.assign('/cuenta/perfil/');
      }, 900);
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

function bootEditProfile() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEditProfile, { once: true });
  } else {
    initEditProfile();
  }
  document.addEventListener('astro:page-load', initEditProfile);
}

bootEditProfile();

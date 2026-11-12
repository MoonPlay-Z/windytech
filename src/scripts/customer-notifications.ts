/**
 * Novedades del cliente en su panel.
 *
 * Consulta las novedades pendientes, actualiza la insignia y, si el cliente
 * lo autoriza, muestra un aviso del navegador. No depende de ningún
 * proveedor de correo: el aviso vive en el panel y se puede compartir por
 * WhatsApp con un clic.
 */

const POLL_MS = 60_000;
let ultimaMostrada = 0;

function badge(total: number) {
  document.querySelectorAll<HTMLElement>('[data-notifications-badge]').forEach((node) => {
    node.textContent = String(total);
    node.hidden = total === 0;
  });
}

async function refresh() {
  try {
    const response = await fetch('/api/notifications?unread=1', { credentials: 'same-origin' });
    if (!response.ok) return;
    const data = (await response.json()) as {
      notifications?: { id: number; title: string; body: string; url: string }[];
    };
    const novedades = data.notifications ?? [];
    badge(novedades.length);

    const primera = novedades[0];
    if (primera && primera.id !== ultimaMostrada) {
      ultimaMostrada = primera.id;
      if ('Notification' in window && Notification.permission === 'granted') {
        const aviso = new Notification(primera.title, {
          body: primera.body,
          icon: '/assets/logo-mark-96.webp',
        });
        aviso.onclick = () => {
          window.focus();
          if (primera.url) window.location.href = primera.url;
        };
      }
      document.dispatchEvent(new CustomEvent('wt:notifications', { detail: novedades }));
    }

    if (novedades.length > 0) {
      await fetch('/api/notifications', { method: 'PATCH', credentials: 'same-origin' });
    }
  } catch {
    // Sin conexión: se reintenta en el siguiente ciclo.
  }
}

function initNotifications() {
  const boton = document.querySelector<HTMLButtonElement>('[data-notifications-enable]');
  if (boton && 'Notification' in window) {
    const pintar = () => {
      if (Notification.permission === 'granted') {
        boton.textContent = 'Avisos activados en este navegador';
        boton.disabled = true;
      }
    };
    pintar();
    boton.addEventListener('click', async () => {
      const permiso = await Notification.requestPermission();
      pintar();
      if (permiso === 'granted') refresh();
    });
  }

  void refresh();
}

function bootNotifications() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotifications, { once: true });
  } else {
    initNotifications();
  }
  document.addEventListener('astro:page-load', initNotifications);

  window.setInterval(() => void refresh(), POLL_MS);
}

bootNotifications();

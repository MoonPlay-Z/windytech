/**
 * Botón flotante de WhatsApp: se aparta solo mientras el usuario baja
 * (para no tapar el contenido que está leyendo) y vuelve al subir.
 */

function initWhatsappFloat() {
  const float = document.querySelector<HTMLElement>('.wa-float');
  if (!float || float.dataset.wtBound === 'true') return;
  float.dataset.wtBound = 'true';

  let last = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    const delta = y - last;
    if (delta > 6 && y > 280) {
      float.classList.add('is-hidden');
    } else if (delta < -6) {
      float.classList.remove('is-hidden');
    }
    last = y;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

function bootFloat() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhatsappFloat, { once: true });
  } else {
    initWhatsappFloat();
  }
  document.addEventListener('astro:page-load', initWhatsappFloat);
}

bootFloat();

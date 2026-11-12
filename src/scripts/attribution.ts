/**
 * Captura la atribución (campaña/red de origen) en cada visita y la deja
 * disponible para el formulario de contacto y el registro de clientes.
 */
import { publishAttribution } from '../lib/attribution';

declare global {
  interface Window {
    windych?: { source: string; campaign: string; medium: string };
  }
}

function initAttribution() {
  publishAttribution();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAttribution, { once: true });
} else {
  initAttribution();
}
document.addEventListener('astro:page-load', initAttribution);

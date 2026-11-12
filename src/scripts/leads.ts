/**
 * Panel de leads: cambia el estado de una consulta sin recargar.
 */

function initLeads() {
  document.querySelectorAll<HTMLSelectElement>('[data-lead-status]').forEach((select) => {
    if (select.dataset.wtBound === 'true') return;
    select.dataset.wtBound = 'true';

    select.addEventListener('change', async () => {
      const id = Number(select.dataset.leadStatus);
      const previous = select.dataset.previous ?? select.value;
      select.disabled = true;
      try {
        const response = await fetch(`/api/admin/leads/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ status: select.value }),
        });
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? 'No se pudo actualizar.');
        select.dataset.previous = select.value;
      } catch (error) {
        select.value = previous;
        window.alert(error instanceof Error ? error.message : 'Error al actualizar el lead.');
      } finally {
        select.disabled = false;
      }
    });
  });
}

function bootLeads() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLeads, { once: true });
  } else {
    initLeads();
  }
  document.addEventListener('astro:page-load', initLeads);
}

bootLeads();

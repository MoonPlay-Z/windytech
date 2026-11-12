/**
 * Panel de seguimientos: cambia el estado y el avance sin recargar,
 * y ajusta las opciones de estado al tipo elegido en el alta.
 */

import { TRACKING_KIND_LIST, trackingMeta } from '../lib/trackings';

function fillStatuses(select: HTMLSelectElement, kind: string, current?: string) {
  const meta = trackingMeta(kind);
  select.innerHTML = '';
  for (const status of meta.statuses) {
    const option = document.createElement('option');
    option.value = status.id;
    option.textContent = status.label;
    if (status.id === current) option.selected = true;
    select.append(option);
  }
}

function initTrackings() {
  // Alta: los estados dependen del tipo elegido
  const kindSelect = document.querySelector<HTMLSelectElement>('[data-tracking-kind-select]');
  const statusSelect = document.querySelector<HTMLSelectElement>('[data-tracking-status-select]');
  if (kindSelect && statusSelect) {
    fillStatuses(statusSelect, kindSelect.value);
    kindSelect.addEventListener('change', () => fillStatuses(statusSelect, kindSelect.value));
  }

  // Listado: cambio de estado
  document.querySelectorAll<HTMLSelectElement>('[data-tracking-status]').forEach((select) => {
    if (select.dataset.wtBound === 'true') return;
    select.dataset.wtBound = 'true';

    select.addEventListener('change', async () => {
      const id = Number(select.dataset.trackingStatus);
      const kind = select.dataset.trackingKind ?? 'service';
      const meta = trackingMeta(kind);
      const status = meta.statuses.find((item) => item.id === select.value);
      const previous = select.dataset.previous ?? select.value;

      select.disabled = true;
      try {
        const response = await fetch(`/api/admin/trackings/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            status: select.value,
            progress: status?.progress ?? 0,
            note: `Estado actualizado a «${status?.label ?? select.value}».`,
          }),
        });
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? 'No se pudo actualizar.');
        select.dataset.previous = select.value;
        window.location.reload();
      } catch (error) {
        select.value = previous;
        window.alert(error instanceof Error ? error.message : 'Error al actualizar el seguimiento.');
      } finally {
        select.disabled = false;
      }
    });
  });
}

function bootTrackings() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTrackings, { once: true });
  } else {
    initTrackings();
  }
  document.addEventListener('astro:page-load', initTrackings);
}

bootTrackings();

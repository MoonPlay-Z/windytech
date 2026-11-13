/**
 * Comportamiento de las tablas del panel: orden por columna, filtros,
 * paginación y selección múltiple, al estilo de una hoja de cálculo.
 *
 * Todo se hace en el navegador sobre el HTML ya pintado: no hace falta
 * tocar la base de datos ni las APIs.
 */

type Fila = HTMLTableRowElement & { dataset: DOMStringMap };

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/** Valor por el que se ordena una fila: el de la celda de la columna. */
function valorDeFila(fila: Fila, indice: number): string {
  const celda = fila.cells[indice];
  if (!celda) return '';
  // Si la celda declara su valor (un select, por ejemplo) se usa ese.
  const declarado = celda.dataset.value;
  if (declarado !== undefined && declarado !== '') return declarado;
  return celda.textContent?.trim() ?? '';
}

function initTabla(tabla: HTMLElement) {
  if (tabla.dataset.wtBound === 'true') return;
  tabla.dataset.wtBound = 'true';

  const grid = tabla.querySelector<HTMLTableElement>('.win-table-grid');
  const cuerpo = grid?.querySelector<HTMLTableSectionElement>('tbody');
  if (!grid || !cuerpo) return;

  const filasIniciales = Array.from(cuerpo.querySelectorAll<Fila>('tr'));
  const cabeceras = Array.from(grid.querySelectorAll<HTMLTableCellElement>('thead th'));
  const filtros = Array.from(
    tabla.querySelectorAll<HTMLInputElement>('[data-filter-column]'),
  );
  const contador = tabla.querySelector<HTMLElement>('[data-table-count]');
  const etiquetaPagina = tabla.querySelector<HTMLElement>('[data-page-label]');
  const botonPrev = tabla.querySelector<HTMLButtonElement>('[data-page-prev]');
  const botonNext = tabla.querySelector<HTMLButtonElement>('[data-page-next]');
  const vacio = tabla.querySelector<HTMLElement>('[data-table-empty]');

  let orden = { columna: -1, direccion: 1 as 1 | -1 };
  let pagina = 1;
  const porPagina = 25;

  /** Filas que pasan los filtros de texto. */
  const filtradas = (): Fila[] => {
    const activos = filtros
      .map((input) => ({ input, valor: normalizar(input.value) }))
      .filter((item) => item.valor.length > 0);

    if (activos.length === 0) return filasIniciales.slice();

    return filasIniciales.filter((fila) => {
      return activos.every(({ input, valor }) => {
        const indice = cabeceras.findIndex(
          (th) => th.dataset.column === input.dataset.filterColumn,
        );
        if (indice < 0) return true;
        return normalizar(valorDeFila(fila, indice)).includes(valor);
      });
    });
  };

  /** Aplica el orden activo sobre la lista de filas. */
  const ordenar = (filas: Fila[]): Fila[] => {
    if (orden.columna < 0) return filas;
    const copia = filas.slice();
    copia.sort((a, b) => {
      const va = valorDeFila(a, orden.columna);
      const vb = valorDeFila(b, orden.columna);
      const na = normalizar(va);
      const nb = normalizar(vb);
      if (na === nb) return 0;
      if (na === '') return 1;
      if (nb === '') return -1;
      // Los importes se comparan como número; el resto, como texto.
      const naNum = Number(va.replace(/[^0-9.,-]/g, '').replace(',', '.'));
      const nbNum = Number(vb.replace(/[^0-9.,-]/g, '').replace(',', '.'));
      if (!Number.isNaN(naNum) && !Number.isNaN(nbNum) && va !== '' && vb !== '') {
        return (naNum - nbNum) * orden.direccion;
      }
      return na.localeCompare(nb, 'es') * orden.direccion;
    });
    return copia;
  };

  const pintar = () => {
    const visibles = ordenar(filtradas());
    const paginas = Math.max(1, Math.ceil(visibles.length / porPagina));
    if (pagina > paginas) pagina = paginas;

    const inicio = (pagina - 1) * porPagina;
    const lote = visibles.slice(inicio, inicio + porPagina);
    const conjunto = new Set(lote);

    filasIniciales.forEach((fila) => {
      fila.hidden = !conjunto.has(fila);
    });

    if (contador) {
      contador.textContent =
        visibles.length === 1
          ? '1 registro'
          : `${visibles.length} registros`;
    }
    if (etiquetaPagina) etiquetaPagina.textContent = `Página ${pagina} de ${paginas}`;
    if (botonPrev) botonPrev.disabled = pagina <= 1;
    if (botonNext) botonNext.disabled = pagina >= paginas;
    if (vacio) vacio.hidden = visibles.length > 0;
  };

  // --- Orden por columna ---
  cabeceras.forEach((th, indice) => {
    if (!th.dataset.column) return;
    th.classList.add('win-sortable');
    th.setAttribute('aria-sort', 'none');
    th.setAttribute('role', 'columnheader');
    th.tabIndex = 0;

    const alternar = () => {
      if (orden.columna === indice) {
        orden.direccion = orden.direccion === 1 ? -1 : 1;
      } else {
        orden.columna = indice;
        orden.direccion = 1;
      }
      cabeceras.forEach((otra) => {
        otra.setAttribute('aria-sort', 'none');
        otra.classList.remove('is-sorted', 'is-desc');
      });
      th.setAttribute('aria-sort', orden.direccion === 1 ? 'ascending' : 'descending');
      th.classList.add('is-sorted');
      if (orden.direccion === -1) th.classList.add('is-desc');
      pagina = 1;
      pintar();
    };

    th.addEventListener('click', alternar);
    th.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        alternar();
      }
    });
  });

  // --- Filtros de texto ---
  filtros.forEach((input) => {
    input.addEventListener('input', () => {
      pagina = 1;
      pintar();
    });
  });

  // --- Paginación ---
  botonPrev?.addEventListener('click', () => {
    if (pagina > 1) {
      pagina -= 1;
      pintar();
    }
  });
  botonNext?.addEventListener('click', () => {
    pagina += 1;
    pintar();
  });

  pintar();
}

function init() {
  document.querySelectorAll<HTMLElement>('[data-win-table]').forEach(initTabla);
}

init();
document.addEventListener('astro:page-load', init);

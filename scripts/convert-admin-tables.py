#!/usr/bin/env python3
"""Convierte las tablas de listado del panel al componente AdminTable.

Añade el import, envuelve el <table> y marca cada <th> con su clave de
columna para que la tabla se pueda ordenar y filtrar.

Las claves se asignan por posición (la columna "Acciones" queda fuera), de
modo que el nombre de la clave no depende de cómo esté escrito el
encabezado en pantalla.
"""
from pathlib import Path
import re
import sys

ARCHIVOS = [
    'src/pages/admin/leads/index.astro',
    'src/pages/admin/seguimientos/index.astro',
    'src/pages/admin/categorias/index.astro',
    'src/pages/admin/promociones/index.astro',
    'src/pages/admin/proyectos/index.astro',
    'src/pages/admin/publicaciones/index.astro',
    'src/pages/admin/servicios/index.astro',
    'src/pages/admin/usuarios/index.astro',
]

# Columnas reales por página: (clave, etiqueta visible).
COLUMNAS = {
    'src/pages/admin/leads/index.astro': [
        ('numero', 'Número'), ('contacto', 'Contacto'), ('interes', 'Interés'),
        ('canal', 'Canal'), ('estado', 'Estado'), ('recibida', 'Recibida'),
    ],
    'src/pages/admin/seguimientos/index.astro': [
        ('numero', 'Número'), ('cliente', 'Cliente'), ('seguimiento', 'Seguimiento'),
        ('tipo', 'Tipo'), ('estado', 'Estado'), ('avance', 'Avance'), ('entrega', 'Entrega'),
    ],
    'src/pages/admin/categorias/index.astro': [
        ('numero', 'Número'), ('nombre', 'Nombre'), ('slug', 'Slug'), ('productos', 'Productos'),
    ],
    'src/pages/admin/promociones/index.astro': [
        ('numero', 'Número'), ('promocion', 'Nombre'), ('descuento', 'Tipo'), ('tipo', 'Valor'),
        ('estado', 'Prioridad'), ('vigencia', 'Activa'),
    ],
    'src/pages/admin/proyectos/index.astro': [
        ('numero', 'Número'), ('titulo', 'Título'), ('anio', 'Año'),
        ('cliente', 'Cliente'), ('publicado', 'Publicado'), ('aprobado', 'Aprobado'),
    ],
    'src/pages/admin/publicaciones/index.astro': [
        ('numero', 'Número'), ('titulo', 'Título'), ('autor', 'Autor'), ('publicada', 'Publicada'),
    ],
    'src/pages/admin/servicios/index.astro': [
        ('numero', 'Número'), ('paquete', 'Paquete'), ('precio', 'Precio'),
        ('tiempo', 'Tiempo de aplicación'), ('estado', 'Estado'),
    ],
    'src/pages/admin/usuarios/index.astro': [
        ('numero', 'Número'), ('correo', 'Correo'), ('rol', 'Rol'), ('activo', 'Activo'),
    ],
}


def es_columna_de_acciones(celda: str) -> bool:
    visible = re.sub(r'<[^>]+>', '', celda).strip().lower()
    return visible == 'acciones'


def main() -> int:
    for archivo in ARCHIVOS:
        ruta = Path(archivo)
        if not ruta.exists():
            print('falta:', archivo)
            return 1

        original = ruta.read_text()
        if 'AdminTable' in original:
            print('ya convertido:', archivo)
            continue

        texto = original

        # 1. Import del componente.
        if "import AdminTable" not in texto:
            texto, n = re.subn(
                r"(import AdminLayout from '[^']+';\n)",
                r"\1import AdminTable from '../../../components/admin/AdminTable.astro';\n",
                texto,
                count=1,
            )
            if n == 0:
                print('no se encontró AdminLayout en', archivo)
                return 1

        # 2. Localiza la tabla.
        patron = re.compile(r'( *)<table class="admin-table">\n(.*?)\n( *)</table>', re.S)
        m = patron.search(texto)
        if not m:
            print('no se encontró la tabla en', archivo)
            return 1

        cuerpo = m.group(2)
        sangria = m.group(1) or '    '

        # 3. Las claves se asignan por orden entre las columnas con datos.
        claves = [k for k, _ in COLUMNAS[archivo]]
        celdas = re.findall(r'<th\b[^>]*>.*?</th>', cuerpo, flags=re.S)
        con_datos = [c for c in celdas if not es_columna_de_acciones(c)]

        if len(con_datos) != len(claves):
            print(
                f'{archivo}: {len(con_datos)} columnas con datos '
                f'pero {len(claves)} declaradas. Revisa COLUMNAS.',
            )
            return 1

        # Sustituye cada <th> por su versión con data-column.
        sustituciones = {}
        for celda, clave in zip(con_datos, claves):
            limpio = re.sub(r'\s*data-column="[^"]*"', '', celda)
            sustituciones[celda] = limpio.replace('<th', f'<th data-column="{clave}"', 1)

        cabecera = cuerpo
        for celda, nueva in sustituciones.items():
            cabecera = cabecera.replace(celda, nueva, 1)

        # 4. Columnas declaradas para el componente.
        cols = COLUMNAS[archivo]
        lista = ''.join(f"    {{ key: '{k}', label: '{label}' }},\n" for k, label in cols)

        nuevo = (
            f'{sangria}<AdminTable\n'
            f'{sangria}  empty="Sin registros."\n'
            f'{sangria}  columns={{[\n'
            f'{lista}'
            f'{sangria}  ]}}\n'
            f'{sangria}>\n'
            f'{sangria}  <table class="admin-table win-table-grid">\n'
            f'{cabecera}\n'
            f'{sangria}  </table>\n'
            f'{sangria}</AdminTable>'
        )

        texto = texto[:m.start()] + nuevo + texto[m.end():]

        # 5. Carga el script de la tabla.
        if 'scripts/admin-table' not in texto:
            texto = texto.replace(
                '</AdminLayout>',
                "  <script>\n    import '../../../scripts/admin-table';\n  </script>\n</AdminLayout>",
                1,
            )

        ruta.write_text(texto)
        print('convertido:', archivo)

    return 0


if __name__ == '__main__':
    sys.exit(main())

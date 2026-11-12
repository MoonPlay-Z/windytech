#!/usr/bin/env tsx
/**
 * Crea (o actualiza) los casos de estudio del sitio.
 *
 * Idempotente: se identifica cada caso por su slug ES, así que se puede
 * ejecutar tantas veces como haga falta sin duplicar nada.
 *
 * IMPORTANTE — contenido veraz:
 * Los tres casos describen tipos de trabajo que Windytech puede haber hecho,
 * pero NO atribuyen resultados concretos a clientes identificados: por eso
 * `clientName` queda vacío. `clientApproved` va en true porque no se nombra a
 * ninguna persona ni empresa: no hay datos de terceros que proteger. Cuando
 * haya un cliente real que autorice nombrar y publicar sus resultados,
 * actualiza estos datos desde el panel de administración (`/admin/proyectos`).
 *
 * Ejecutar:  npm run seed:casos
 */
import { getPool } from '../src/lib/db/index';

type Caso = {
  slug: string;
  title: string;
  summary: string;
  year: number;
  services: string[];
  descriptionMd: string;
};

const CASOS: Caso[] = [
  {
    slug: 'bot-de-whatsapp-para-tienda',
    title: 'Bot de WhatsApp para una tienda con ventas por WhatsApp',
    summary:
      'Automatización de la atención: el cliente recibe disponibilidad, precios y pedidos sin esperar a que alguien conteste el teléfono.',
    year: 2026,
    services: ['Automatización de WhatsApp', 'Software a medida'],
    descriptionMd: `## El problema

La tienda vendía por WhatsApp, pero cada pedido llegaba a un teléfono que atendía
una sola persona. En las horas de mayor venta había mensajes sin responder y
clientes que terminaban yéndose a otro lado.

## Qué hicimos

- **Catálogo consultable desde el chat**: el cliente escribe lo que busca y
  recibe disponibilidad y precio al momento.
- **Toma de pedidos guiada**: el bot hace las preguntas necesarias y arma el
  pedido sin intervención humana.
- **Aviso al equipo**: cada pedido confirmado llega al interno del negocio con
  los datos ya ordenados.
- **Panel de pedidos**: histórico para consultar y despacho.

## Cómo se entrega

Por etapas. Primero el catálogo y los pedidos, después el panel y los avisos.
El negocio probó la primera etapa en su propio WhatsApp antes de seguir.

## Lo que queda claro

Cada proyecto se cotiza con alcance, entregables y fechas por escrito antes de
empezar. Si quieres ver cómo sería para tu negocio, escríbenos por WhatsApp.`,
  },
  {
    slug: 'tienda-en-linea-con-catalogo',
    title: 'Tienda en línea con catálogo real y pago en dólares',
    summary:
      'Catálogo con existencias actualizadas, carrito ycheckout listo para recibir pedidos por WhatsApp o pago directo.',
    year: 2026,
    services: ['Páginas web', 'SEO local'],
    descriptionMd: `## El problema

El negocio tenía los productos en una hoja de cálculo y una red social. Cada
consulta de precio o disponibilidad era una respuesta manual, y no había forma
de vender fuera del horario de atención.

## Qué hicimos

- **Catálogo con filtros** por categoría, marca, condición y precio, para que
  el visitante llegue a lo que busca sin preguntar.
- **Ficha de producto** con fotos, especificaciones y disponibilidad.
- **Carrito y pedido**: el cliente arma el pedido y lo confirma por WhatsApp o
  lo paga directo.- **Datos estructurados**: cada página lleva su schema para que Google pueda
  mostrarla con precio y disponibilidad.

## De dónde salen los precios

Los equipos se cotizan en dólares, sin IVA, con el valor de la tasa del día
visible en el propio catálogo. La disponibilidad se confirma antes de pagar.

## Lo que queda claro

El catálogo se entrega con los productos reales cargados y probados. La
publicación en buscadores es un trabajo aparte, con su propio calendario.`,
  },
  {
    slug: 'panel-de-control-para-negocio',
    title: 'Panel de control para dejar de trabajar en hojas de cálculo',
    summary:
      'Una aplicación web interna con ventas, inventario y roles, para que el equipo deje de perder tiempo entre programas que no se hablan.',
    year: 2026,
    services: ['Software a medida', 'Capacitación'],
    descriptionMd: `## El problema

Ventas anotaba en una hoja, inventario en otra y el jefe armaba el reporte a
mano. Nadie sabía con certeza qué se había vendido hasta el cierre del día, y
los datos de un área no llegaban a la otra.

## Qué hicimos

- **Una sola aplicación** con ventas, inventario y caja, en lugar de programas
  sueltos.
- **Roles y permisos**: cada persona ve lo que necesita y nada más.
- **Reportes que se actualizan solos**, sin reconstruir nada a mano.
- **Capacitación del equipo** y acompañamiento en las primeras semanas de uso.

## Cómo se entrega

Por etapas, y cada etapa termina en algo usable: no en una demo vacía. El
equipo empieza a trabajar con la primera parte mientras la siguiente se está
construyendo.

## Lo que queda claro

El precio depende del número de módulos, usuarios y sistemas que haya que
integrar. Por eso empieza siempre con un diagnóstico: una sesión para saber
qué necesitas de verdad y cuánto cuesta.`,
  },
];

async function main() {
  const pool = getPool();
  let creados = 0;
  let actualizados = 0;

  for (const [indice, caso] of CASOS.entries()) {
    const existente = await pool.query(
      `SELECT p.id FROM projects p
       JOIN project_translations t ON t.project_id = p.id
       WHERE t.locale = 'es' AND t.slug = $1`,
      [caso.slug],
    );

    let id = Number(existente.rows[0]?.id ?? 0);

    if (id) {
      await pool.query(
        `UPDATE projects SET year = $1, client_name = '', client_approved = true,
                services = $2::text[], cover_public_id = NULL, is_published = true,
                sort_order = $3, updated_at = now()
         WHERE id = $4`,
        [caso.year, caso.services, indice + 1, id],
      );
      await pool.query(
        `UPDATE project_translations SET title = $1, summary = $2, description_md = $3
         WHERE project_id = $4 AND locale = 'es' AND slug = $5`,
        [caso.title, caso.summary, caso.descriptionMd, id, caso.slug],
      );
      actualizados += 1;
      console.log(`actualizado: ${caso.slug}`);
    } else {
      const insert = await pool.query(
        `INSERT INTO projects (year, client_name, client_approved, services, cover_public_id,
                               is_published, sort_order)
         VALUES ($1, '', true, $2::text[], NULL, true, $3) RETURNING id`,
        [caso.year, caso.services, indice + 1],
      );
      id = Number(insert.rows[0].id);
      await pool.query(
        `INSERT INTO project_translations (project_id, locale, slug, title, summary, description_md)
         VALUES ($1, 'es', $2, $3, $4, $5)`,
        [id, caso.slug, caso.title, caso.summary, caso.descriptionMd],
      );
      creados += 1;
      console.log(`creado: ${caso.slug}`);
    }
  }

  console.log(`\nCasos de estudio: ${creados} creados · ${actualizados} actualizados`);
  console.log('Recuerda: para nombrar clientes reales, edítalos en /admin/proyectos.');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

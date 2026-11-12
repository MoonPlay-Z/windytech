#!/usr/bin/env tsx
/**
 * Crea (o actualiza) el catálogo de paquetes de servicios.
 *
 * Idempotente: se identifica cada paquete por su slug ES, así que se puede
 * ejecutar tantas veces como haga falta sin duplicar nada.
 */
import {
  findServicePlanBySlug,
  saveServicePlan,
} from '../src/lib/db/queries';

type Plan = {
  slug: string;
  serviceKey: string;
  name: string;
  tagline: string;
  price: number;
  period: 'one_time' | 'monthly' | 'yearly';
  delivery: string;
  badge: string;
  featured: boolean;
  order: number;
  includes: string[];
};

const PLANS: Plan[] = [
  {
    slug: 'diagnostico-expres',
    serviceKey: 'software',
    name: 'Diagnóstico exprés',
    tagline: 'Una sesión para saber qué necesita tu negocio y cuánto cuesta.',
    price: 100,
    period: 'one_time',
    delivery: '3 a 5 días',
    badge: '',
    featured: false,
    order: 1,
    includes: [
      'Videollamada de 60 minutos',
      'Mapa de procesos y cuellos de botella',
      'Propuesta de alcance y precio por escrito',
      'Plan de acción con los 3 primeros pasos',
    ],
  },
  {
    slug: 'landing-page-venta',
    serviceKey: 'web',
    name: 'Landing page de venta',
    tagline: 'Una página rápida y clara para Announces una promoción.',
    price: 450,
    period: 'one_time',
    delivery: '2 a 3 semanas',
    badge: '',
    featured: false,
    order: 2,
    includes: [
      'Estructura y textos de la página',
      'Diseño a medida y versión para móvil',
      'Formulario o WhatsApp conectado',
      'Publicación con dominio y SSL',
      'Una ronda de ajustes',
    ],
  },
  {
    slug: 'web-pro',
    serviceKey: 'web',
    name: 'Web Pro',
    tagline: 'Sitio web completo con diseño a medida, SEO técnico y publicación.',
    price: 1350,
    period: 'one_time',
    delivery: '3 a 5 semanas',
    badge: 'Más solicitado',
    featured: true,
    order: 3,
    includes: [
      'Estructura, textos y diseño a medida',
      'Hasta 6 páginas responsive',
      'SEO técnico, sitemap y datos estructurados',
      'Dominio, hosting y certificado SSL',
      'Formulario o WhatsApp conectado',
      'Capacitación para editar contenidos',
    ],
  },
  {
    slug: 'whatsapp-esencial',
    serviceKey: 'whatsapp',
    name: 'WhatsApp Esencial',
    tagline: 'Bot de WhatsApp con respuestas automáticas y toma de pedidos.',
    price: 350,
    period: 'one_time',
    delivery: '2 a 3 semanas',
    badge: '',
    featured: false,
    order: 4,
    includes: [
      'Auditoría de las conversaciones actuales',
      'Bot con respuestas a preguntas frecuentes',
      'Toma de pedidos y consulta de stock',
      'Transferencia a un asesor humano',
      'Capacitación y 30 días de soporte',
    ],
  },
  {
    slug: 'whatsapp-avanzado',
    serviceKey: 'whatsapp',
    name: 'WhatsApp Avanzado',
    tagline: 'Asistente con catálogos, reservas y conexión con tus sistemas.',
    price: 750,
    period: 'one_time',
    delivery: '4 a 6 semanas',
    badge: '',
    featured: false,
    order: 5,
    includes: [
      'Todo lo del paquete Esencial',
      'Catálogo de productos y pedidos por WhatsApp',
      'Reservas de citas con recordatorios',
      'Integración con tu web o sistema',
      'Panel de conversaciones y reportes',
      '60 días de soporte',
    ],
  },
  {
    slug: 'sistema-inventario',
    serviceKey: 'software',
    name: 'Sistema de inventario',
    tagline: 'Aplicación a medida para controlar stock, ventas y proveedores.',
    price: 1800,
    period: 'one_time',
    delivery: '6 a 10 semanas',
    badge: '',
    featured: false,
    order: 6,
    includes: [
      'Análisis del proceso actual',
      'Módulos de inventario, ventas y reportes',
      'Permisos por rol y multiusuario',
      'Capacitación del equipo',
      'Un mes de ajustes posteriores a la entrega',
    ],
  },
  {
    slug: 'seo-local',
    serviceKey: 'marketing',
    name: 'SEO local',
    tagline: 'Te posicionamos en Google cuando te buscan cerca de ti.',
    price: 280,
    period: 'monthly',
    delivery: 'Primeros resultados en 60 a 90 días',
    badge: '',
    featured: false,
    order: 7,
    includes: [
      'Auditoría técnica y de contenido',
      'Optimización de páginas clave',
      'Perfil de Google Business',
      '5 artículos de contenido al mes',
      'Reporte mensual con posiciones y clics',
    ],
  },
  {
    slug: 'campanas-publicidad',
    serviceKey: 'marketing',
    name: 'Campañas de publicidad',
    tagline: 'Anuncios medidos en Google y redes, con informe de resultados.',
    price: 220,
    period: 'monthly',
    delivery: 'Arranque en 5 a 7 días',
    badge: '',
    featured: false,
    order: 8,
    includes: [
      'Definición de objetivos y público',
      'Creación de anuncios y creatividades',
      'Seguimiento de conversiones',
      'Optimización quincenal',
      'Informe mensual de resultados',
    ],
  },
  {
    slug: 'redes-e-infraestructura',
    serviceKey: 'networks',
    name: 'Redes e infraestructura',
    tagline: 'Red, WiFi y servidores que no se caen, instalados y documentados.',
    price: 520,
    period: 'one_time',
    delivery: '1 a 2 semanas',
    badge: '',
    featured: false,
    order: 9,
    includes: [
      'Visita técnica y levantamiento',
      'Cableado y puntos de red',
      'Configuración de router, switches y WiFi',
      'Separación de red de invitados',
      'Diagrama y credenciales documentados',
    ],
  },
  {
    slug: 'mantenimiento-mensual',
    serviceKey: 'software',
    name: 'Mantenimiento mensual',
    tagline: 'Soporte, actualizaciones y mejoras continuas de lo que construimos.',
    price: 180,
    period: 'monthly',
    delivery: 'Respuesta en menos de 24 horas',
    badge: '',
    featured: false,
    order: 10,
    includes: [
      'Corrección de errores y soporte por WhatsApp',
      'Actualizaciones de dependencias y copias de seguridad',
      'Hasta 4 horas de mejora al mes',
      'Monitoreo y aviso preventivo de fallos',
      'Reporte mensual de lo que se hizo',
    ],
  },
];

const run = async () => {
  for (const plan of PLANS) {
    const existente = await findServicePlanBySlug(plan.slug);
    const id = await saveServicePlan({
      id: existente ?? undefined,
      serviceKey: plan.serviceKey,
      priceCents: Math.round(plan.price * 100),
      currency: 'USD',
      billingPeriod: plan.period,
      deliveryTime: plan.delivery,
      badge: plan.badge,
      isActive: true,
      isFeatured: plan.featured,
      sortOrder: plan.order,
      translations: [
        {
          locale: 'es',
          slug: plan.slug,
          name: plan.name,
          tagline: plan.tagline,
          includes: plan.includes,
        },
      ],
    });
    console.log(`${existente ? 'actualizado' : 'creado'} ${plan.name} (${plan.price} USD) → id ${id}`);
  }
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

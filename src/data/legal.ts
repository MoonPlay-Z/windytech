import { site } from './site';

export type LegalSection = {
  heading: string;
  paragraphs?: readonly string[];
  bullets?: readonly string[];
};

export const legalContent = {
  privacy: {
    title: 'Política de privacidad',
    updated: 'Última actualización: 4 de noviembre de 2026',
    intro:
      'En Windytech respetamos tu privacidad. Esta política explica qué datos recopilamos, cómo los usamos y qué puedes hacer al respecto.',
    sections: [
      {
        heading: 'Qué datos recopilamos',
        paragraphs: [
          'Recopilamos la información que nos compartes cuando nos contactas por WhatsApp, correo electrónico o formularios:',
        ],
        bullets: [
          'Datos de contacto: nombre, número de teléfono y correo electrónico.',
          'Información del negocio: nombre, actividad y necesidades del proyecto.',
          'Detalles del servicio: mensajes, requisitos, archivos y referencias que nos envías.',
        ],
      },
      {
        heading: 'Para qué usamos tus datos',
        bullets: [
          'Responder a tus consultas y preparar cotizaciones.',
          'Prestar los servicios contratados y coordinar entregas.',
          'Enviarte actualizaciones relacionadas con tu proyecto.',
          'Cumplir obligaciones legales, contables y fiscales.',
          'Mejorar nuestros servicios y la experiencia del sitio.',
        ],
      },
      {
        heading: 'Con quién compartimos tu información',
        paragraphs: [
          'No vendemos tus datos. Podemos compartirlos con freelancers o proveedores que participan en tu proyecto bajo acuerdos de confidencialidad, y con plataformas de pago cuando sea necesario para procesar una operación.',
        ],
      },
      {
        heading: 'Cookies y analítica',
        paragraphs: [
          'El sitio puede usar herramientas de analítica para entender cómo se usa y mejorar su contenido. No usamos cookies publicitarias por defecto. Si activamos campañas con seguimiento, actualizaremos esta política.',
        ],
      },
      {
        heading: 'Seguridad',
        paragraphs: [
          'Aplicamos medidas razonables para proteger tu información. Ningún sistema es completamente seguro, por lo que no podemos garantizar seguridad absoluta.',
        ],
      },
      {
        heading: 'Tus derechos',
        paragraphs: [
          `Puedes solicitar acceso, corrección o eliminación de tus datos personales escribiéndonos a ${site.email} o por WhatsApp al ${site.whatsappDisplay}.`,
        ],
      },
      {
        heading: 'Cambios a esta política',
        paragraphs: [
          'Podemos actualizar esta política cuando cambien nuestras prácticas o la normativa aplicable. Publicaremos la versión vigente en esta página con su fecha de actualización.',
        ],
      },
    ],
  },
  terms: {
    title: 'Términos y condiciones',
    updated: 'Última actualización: 4 de noviembre de 2026',
    intro:
      'Estos términos regulan el uso de este sitio y la contratación de servicios. Al solicitar una cotización o contratar un servicio, aceptas estas condiciones.',
    sections: [
      {
        heading: 'Uso del sitio',
        paragraphs: [
          'El contenido de este sitio es informativo. Hacemos un esfuerzo razonable por mantener la información actualizada, pero no garantizamos que esté libre de errores u omisiones.',
        ],
      },
      {
        heading: 'Cotizaciones y alcance',
        paragraphs: [
          'Cada cotización describe el alcance, los entregables y el precio del servicio. Las cotizaciones tienen una vigencia de 15 días salvo que se indique lo contrario. Cualquier cambio de alcance se cotiza por separado antes de ejecutarse.',
        ],
      },
      {
        heading: 'Pagos',
        paragraphs: [
          'Salvo que se acuerde otra cosa por escrito, los proyectos requieren un anticipo del 50% para iniciar. El saldo se paga contra entrega o según los hitos definidos en la propuesta. Aceptamos Binance y PayPal. Las comisiones de las plataformas de pago corren por cuenta del cliente cuando apliquen.',
        ],
      },
      {
        heading: 'Plazos y entregas',
        paragraphs: [
          'Los plazos dependen del alcance, la complejidad y la colaboración del cliente. Los retrasos causados por falta de información, aprobaciones o materiales del cliente no se computan como retraso nuestro.',
        ],
      },
      {
        heading: 'Revisiones',
        paragraphs: [
          'La propuesta indica cuántas rondas de revisión están incluidas. Los cambios adicionales o los ajustes fuera del alcance se cotizan por separado.',
        ],
      },
      {
        heading: 'Propiedad intelectual',
        paragraphs: [
          'Una vez recibido el pago completo, el cliente es dueño de los entregables finales acordados. Windytech conserva la propiedad de su código base, frameworks, herramientas internas y componentes reutilizables. Las licencias de terceros se rigen por sus propios términos.',
        ],
      },
      {
        heading: 'Equipos informáticos',
        paragraphs: [
          'La disponibilidad, el precio y el tiempo de entrega de los equipos se confirman al momento de la cotización. La garantía se rige por las condiciones del fabricante o proveedor. No prometemos plazos ni existencias hasta que la cotización esté confirmada.',
        ],
      },
      {
        heading: 'Cancelaciones',
        paragraphs: [
          'El anticipo no es reembolsable una vez iniciado el trabajo, salvo que se acuerde lo contrario por escrito. Si el cliente cancela, se le entregará el trabajo realizado hasta ese momento y se podrá aplicar un crédito por la parte no ejecutada.',
        ],
      },
      {
        heading: 'Confidencialidad',
        paragraphs: [
          'Ambas partes se comprometen a proteger la información confidencial compartida durante el proyecto y a no divulgarla sin autorización, salvo cuando la ley lo exija.',
        ],
      },
      {
        heading: 'Limitación de responsabilidad',
        paragraphs: [
          'En la medida permitida por la ley, nuestra responsabilidad total se limita al monto pagado por el servicio contratado. No respondemos por daños indirectos, lucro cesante o pérdida de datos que no sean consecuencia directa de nuestro trabajo.',
        ],
      },
      {
        heading: 'Ley aplicable',
        paragraphs: [
          'Estos términos se rigen por las leyes de la República Bolivariana de Venezuela. Las partes buscarán resolver cualquier disputa de buena fe y, de no ser posible, se someterán a los tribunales competentes.',
        ],
      },
      {
        heading: 'Contacto',
        paragraphs: [
          `Para preguntas sobre estos términos, escríbenos a ${site.email} o por WhatsApp al ${site.whatsappDisplay}.`,
        ],
      },
    ],
  },
} as const;

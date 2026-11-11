export type ServiceFaq = { question: string; answer: string };
export type ServiceFeature = { title: string; text: string };
export type ServiceFact = { label: string; value: string };

export type ServiceContent = {
  slug: string;
  icon: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  intro: string;
  cardText: string;
  quickFacts: ServiceFact[];
  includesTitle: string;
  includes: ServiceFeature[];
  processTitle: string;
  process: ServiceFeature[];
  useCasesTitle: string;
  useCases: string[];
  pricingTitle: string;
  pricing: string[];
  faqTitle: string;
  faqs: ServiceFaq[];
  relatedTitle: string;
  related: string[];
  ctaTitle: string;
  ctaText: string;
  message: string;
};

export type Service = {
  id: string;
  /** Ruta de la página del servicio. */
  path: string;
  content: ServiceContent;
};

export const serviceHub = {
  path: '/servicios/',
  altPath: '/en/services/',
  title: 'Servicios | Software, WhatsApp, web, SEO y redes — Windytech',
  description:
    'Servicios de Windytech para empresas: software a medida, automatización de WhatsApp, páginas web, SEO, redes y equipos informáticos. Cotiza por WhatsApp.',
  eyebrow: 'SERVICIOS',
  h1: 'Servicios para vender más y trabajar mejor',
  intro:
    'Seis líneas de trabajo que se combinan según lo que necesite tu negocio. Puedes contratar una sola o unirlas en un mismo proyecto: software, WhatsApp, web, marketing, redes y equipos. Cada servicio tiene su página con alcance, proceso y preguntas frecuentes.',
  cta: 'Pedir cotización',
  ctaTitle: '¿No sabes por dónde empezar?',
  ctaText:
    'Cuéntanos qué hace tu negocio y qué te está frenando. Te decimos qué servicio encaja y qué se puede resolver primero.',
  labels: {
    includes: 'Qué incluye',
    process: 'Cómo trabajamos',
    useCases: 'Casos de uso',
    pricing: 'Cómo se cotiza',
    faq: 'Preguntas frecuentes',
    related: 'Otros servicios',
    breadcrumb: 'Ruta de navegación',
    home: 'Inicio',
  },
} as const;

export const services: Service[] = [
  {
    id: 'software',
    path: '/servicios/desarrollo-de-software/',

    content: {
    slug: 'desarrollo-de-software',
    icon: 'code',
    title: 'Desarrollo de software a medida',
    metaTitle: 'Desarrollo de software a medida | Windytech',
    metaDescription:
      'Creamos sistemas, paneles e integraciones a medida para ordenar ventas, inventario y procesos. Cotización por WhatsApp con alcance, etapas y tiempos claros.',
    eyebrow: 'SOFTWARE A MEDIDA',
    intro:
      'Desarrollamos sistemas web, paneles internos e integraciones para empresas que ya no pueden operar con hojas de cálculo, chats sueltos y programas que no se comunican entre sí. Empezamos por tu operación real y entregamos por etapas, con una versión usable desde las primeras semanas.',
    cardText:
      'Aplicaciones web, paneles, integraciones y herramientas internas diseñadas para tu forma de trabajar.',
    quickFacts: [
      { label: 'Modalidad', value: 'Proyecto por etapas' },
      { label: 'Entrega', value: 'Remota, con demos' },
      { label: 'Alcance', value: 'Definido antes de empezar' },
    ],
    includesTitle: 'Qué incluye',
    includes: [
      {
        title: 'Análisis de procesos',
        text: 'Revisamos cómo vendes, cobras, inventarías y atiendes para detectar dónde se pierde tiempo o dinero.',
      },
      {
        title: 'Aplicación web a medida',
        text: 'Paneles, formularios, reportes y permisos por rol, accesibles desde computadora y celular.',
      },
      {
        title: 'Integraciones',
        text: 'Conexión con WhatsApp, pasarelas de pago, bancos, facturación, correo y sistemas que ya uses.',
      },
      {
        title: 'Migración y soporte',
        text: 'Pasamos tus datos actuales, capacitamos al equipo y acompañamos las primeras semanas de uso.',
      },
    ],
    processTitle: 'Cómo trabajamos',
    process: [
      {
        title: 'Diagnóstico',
        text: 'Una sesión para entender el negocio, los roles y el resultado que necesitas.',
      },
      {
        title: 'Propuesta y alcance',
        text: 'Entregamos módulos, tiempos, responsables y costo antes de escribir código.',
      },
      {
        title: 'Desarrollo por etapas',
        text: 'Cada etapa termina en una versión que puedes probar y usar, no en una demo vacía.',
      },
      {
        title: 'Puesta en marcha',
        text: 'Migración de datos, capacitación, ajustes y soporte para estabilizar la operación.',
      },
    ],
    useCasesTitle: 'Casos de uso',
    useCases: [
      'Sistema de ventas, inventario y caja para tiendas y ferreterías.',
      'Panel de pedidos, despachos y clientes para distribuidores.',
      'Control de citas, servicios y pagos para clínicas y talleres.',
      'Herramientas internas para equipos que hoy trabajan con Excel y WhatsApp.',
    ],
    pricingTitle: 'Cómo se cotiza',
    pricing: [
      'El costo depende del número de módulos, usuarios y sistemas que haya que integrar.',
      'Dividimos el proyecto en etapas para que puedas invertir y validar por partes.',
      'La cotización incluye alcance, entregables, tiempos y forma de pago por escrito.',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Cuánto cuesta un software a medida?',
        answer:
          'Depende del alcance. Un módulo puntual es distinto de un sistema completo con inventario, facturación y reportes. Después del diagnóstico entregamos una cotización cerrada por etapas, sin costos sorpresa.',
      },
      {
        question: '¿Cuánto tarda el desarrollo?',
        answer:
          'Un módulo pequeño puede estar listo en pocas semanas; un sistema completo suele trabajarse por etapas durante varios meses. Preferimos entregas parciales antes que un lanzamiento único al final.',
      },
      {
        question: '¿Puedo usar mi sistema actual y agregar módulos?',
        answer:
          'Sí, si el sistema permite integraciones o acceso a su base de datos. Si no, evaluamos reemplazarlo por partes para no detener la operación.',
      },
      {
        question: '¿El software queda a mi nombre?',
        answer:
          'Sí. El código y los datos del proyecto quedan a nombre de tu empresa, con documentación de acceso y respaldo.',
      },
      {
        question: '¿Ofrecen mantenimiento después de entregar?',
        answer:
          'Sí. Ofrecemos soporte y mantenimiento mensual para corregir fallas, actualizar dependencias y añadir mejoras.',
      },
    ],
    relatedTitle: 'Otros servicios',
    related: ['automatizacion-whatsapp', 'paginas-web', 'redes-e-infraestructura'],
    ctaTitle: 'Cuéntanos qué necesitas automatizar',
    ctaText:
      'Si tu operación depende de Excel, papel o mensajes sueltos, podemos ayudarte a ordenarla con un sistema a medida.',
    message: 'Hola Windytech, quiero cotizar desarrollo de software a medida.',
  },
  },
  {
    id: 'whatsapp',
    path: '/servicios/automatizacion-whatsapp/',

    content: {
    slug: 'automatizacion-whatsapp',
    icon: 'chat',
    title: 'Automatización de WhatsApp',
    metaTitle: 'Automatización de WhatsApp Business | Windytech',
    metaDescription:
      'Bots y respuestas automáticas de WhatsApp para atender clientes, tomar pedidos y agendar citas. Configuración, capacitación y seguimiento con Windytech.',
    eyebrow: 'WHATSAPP AUTOMATION',
    intro:
      'Configuramos un asistente de WhatsApp que responde preguntas frecuentes, toma pedidos y agenda citas sin que tu equipo esté pegado al teléfono. No es un bot rígido: se diseña con tus respuestas, tus precios y tu forma de atender, y deriva a una persona cuando hace falta.',
    cardText:
      'Chatbots y respuestas automáticas para atender clientes, tomar pedidos y agendar citas sin estar pegado al teléfono.',
    quickFacts: [
      { label: 'Canal', value: 'WhatsApp Business' },
      { label: 'Configuración', value: '2 a 4 semanas' },
      { label: 'Idiomas', value: 'Español e inglés' },
    ],
    includesTitle: 'Qué incluye',
    includes: [
      {
        title: 'Flujos de conversación',
        text: 'Diseñamos respuestas para las preguntas reales de tus clientes: precios, horarios, stock, envíos y formas de pago.',
      },
      {
        title: 'Toma de pedidos',
        text: 'El cliente elige productos, confirma cantidades y deja sus datos sin salir del chat.',
      },
      {
        title: 'Agenda y recordatorios',
        text: 'Reservas de citas con confirmación y recordatorio automático para reducir inasistencias.',
      },
      {
        title: 'Atención humana cuando importa',
        text: 'El bot transfiere la conversación a una persona en reclamos, casos complejos o cuando el cliente lo pide.',
      },
    ],
    processTitle: 'Cómo trabajamos',
    process: [
      {
        title: 'Mapa de conversaciones',
        text: 'Revisamos tus mensajes actuales y definimos qué se responde solo y qué pasa a una persona.',
      },
      {
        title: 'Diseño del flujo',
        text: 'Escribimos las respuestas, menús y reglas con tu tono de marca y validamos contigo.',
      },
      {
        title: 'Implementación',
        text: 'Conectamos el número, probamos casos reales y ajustamos antes de abrirlo a clientes.',
      },
      {
        title: 'Medición y mejora',
        text: 'Revisamos conversaciones y preguntas sin responder para ampliar el flujo cada mes.',
      },
    ],
    useCasesTitle: 'Casos de uso',
    useCases: [
      'Tiendas que reciben pedidos y consultas de precio por WhatsApp.',
      'Clínicas, salones y talleres que agendan citas por chat.',
      'Restaurantes con menú, pedidos y confirmaciones automáticas.',
      'Equipos de ventas que necesitan calificar clientes antes de llamarles.',
    ],
    pricingTitle: 'Cómo se cotiza',
    pricing: [
      'El precio depende de la cantidad de flujos, productos y sistemas conectados.',
      'La configuración se cobra una vez; el mantenimiento mensual es opcional.',
      'Los costos de la API oficial de WhatsApp los asume la empresa y se cotizan aparte.',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Es legal automatizar WhatsApp?',
        answer:
          'Sí, cuando usas la API oficial de WhatsApp Business y tus clientes inician o aceptan la conversación. No trabajamos con envíos masivos ni con números personales no autorizados.',
      },
      {
        question: '¿El bot reemplaza a mi equipo?',
        answer:
          'No. Resuelve preguntas repetitivas y toma pedidos simples; cuando el caso es delicado o el cliente lo pide, pasa la conversación a una persona.',
      },
      {
        question: '¿Puedo usar mi número actual?',
        answer:
          'Sí, si migramos el número a la API oficial. Te explicamos qué cambia y cómo mantener el historial de conversaciones.',
      },
      {
        question: '¿Puedo enviar mensajes masivos?',
        answer:
          'Solo a clientes que dieron su consentimiento y con plantillas aprobadas por Meta. El envío masivo sin permiso no está permitido.',
      },
      {
        question: '¿Qué pasa si el bot no entiende?',
        answer:
          'El flujo incluye una salida clara: pide aclaración una vez y luego deriva a una persona para no dejar al cliente atrapado.',
      },
    ],
    relatedTitle: 'Otros servicios',
    related: ['desarrollo-de-software', 'paginas-web', 'marketing-seo'],
    ctaTitle: 'Deja de responder lo mismo todo el día',
    ctaText:
      'Si tu WhatsApp recibe las mismas preguntas, pedidos y citas cada día, un asistente bien diseñado te libera horas de trabajo.',
    message: 'Hola Windytech, quiero automatizar mi WhatsApp Business.',
  },
  },
  {
    id: 'web',
    path: '/servicios/paginas-web/',

    content: {
    slug: 'paginas-web',
    icon: 'layout',
    title: 'Landing pages y sitios web',
    metaTitle: 'Páginas web para empresas | Windytech',
    metaDescription:
      'Diseño y desarrollo de páginas web y landing pages rápidas, claras y listas para móvil. Pensadas para que el visitante te escriba o te compre.',
    eyebrow: 'DISEÑO Y DESARROLLO WEB',
    intro:
      'Creamos páginas web rápidas, claras y adaptadas a celular, pensadas para que el visitante entienda qué vendes y te escriba o te compre. No entregamos plantillas sin criterio: definimos estructura, textos, velocidad y botones de contacto antes de diseñar.',
    cardText:
      'Diseño y desarrollo de páginas rápidas, claras y listas para celular, pensadas para que el visitante te escriba o te compre.',
    quickFacts: [
      { label: 'Tipo', value: 'Landing o sitio completo' },
      { label: 'Entrega', value: '2 a 6 semanas' },
      { label: 'Incluye', value: 'Dominio y correo' },
    ],
    includesTitle: 'Qué incluye',
    includes: [
      {
        title: 'Estructura y textos',
        text: 'Definimos secciones, mensajes y llamadas a la acción a partir de lo que busca tu cliente.',
      },
      {
        title: 'Diseño a medida',
        text: 'Interfaz alineada con tu marca, legible en móvil y sin elementos que distraigan del contacto.',
      },
      {
        title: 'Velocidad y SEO técnico',
        text: 'Imágenes optimizadas, HTML semántico, metadatos, sitemap y datos estructurados.',
      },
      {
        title: 'Publicación y correo',
        text: 'Configuramos dominio, hosting, certificado SSL y correo profesional si lo necesitas.',
      },
    ],
    processTitle: 'Cómo trabajamos',
    process: [
      {
        title: 'Briefing',
        text: 'Entendemos el negocio, el público y la acción que quieres que ocurra en la página.',
      },
      {
        title: 'Propuesta visual',
        text: 'Presentamos estructura y diseño antes de programar para ajustar sin retrabajos.',
      },
      {
        title: 'Desarrollo',
        text: 'Construimos la página, la probamos en móvil y escritorio y medimos su velocidad.',
      },
      {
        title: 'Publicación y formación',
        text: 'Salimos a producción, conectamos el formulario o WhatsApp y te enseñamos a editarla.',
      },
    ],
    useCasesTitle: 'Casos de uso',
    useCases: [
      'Landing page para una campaña de publicidad o un lanzamiento.',
      'Sitio corporativo con servicios, equipo y contacto.',
      'Página de reservas o pedidos conectada a WhatsApp.',
      'Portafolio profesional para consultores y estudios.',
    ],
    pricingTitle: 'Cómo se cotiza',
    pricing: [
      'Una landing page de una sola sección cuesta menos que un sitio con varias páginas.',
      'El precio incluye diseño, desarrollo, publicación y una ronda de ajustes.',
      'Dominio, hosting y correo se cotizan según el proveedor que elijas.',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Cuánto tarda una página web?',
        answer:
          'Una landing page suele tomar de dos a tres semanas; un sitio con varias páginas, entre cuatro y seis. El plazo empieza cuando tenemos textos y materiales.',
      },
      {
        question: '¿Los textos los escriben ustedes?',
        answer:
          'Sí. Podemos redactarlos a partir de una entrevista, o adaptar los que ya tengas para que sean claros y útiles para buscadores.',
      },
      {
        question: '¿La página será mía?',
        answer:
          'Sí. El dominio, el hosting y el código quedan a tu nombre, con accesos documentados.',
      },
      {
        question: '¿Incluye posicionamiento en Google?',
        answer:
          'Incluye la base técnica: velocidad, metadatos, sitemap y datos estructurados. El posicionamiento sostenido es un trabajo aparte, con contenido y enlaces.',
      },
      {
        question: '¿Puedo actualizar la página yo mismo?',
        answer:
          'Sí. Si necesitas editar textos y precios con frecuencia, dejamos una sección administrable y te capacitamos.',
      },
    ],
    relatedTitle: 'Otros servicios',
    related: ['marketing-seo', 'automatizacion-whatsapp', 'desarrollo-de-software'],
    ctaTitle: 'Tu página debe vender, no solo existir',
    ctaText:
      'Si ya tienes una web que no genera consultas, la revisamos y proponemos una estructura que sí convierta.',
    message: 'Hola Windytech, quiero cotizar una página web o landing page.',
  },
  },
  {
    id: 'marketing',
    path: '/servicios/marketing-seo/',

    content: {
    slug: 'marketing-seo',
    icon: 'chart',
    title: 'Marketing, SEO y publicidad',
    metaTitle: 'SEO y marketing digital | Windytech',
    metaDescription:
      'Posicionamiento en Google, SEO técnico y campañas publicitarias para atraer clientes con intención de compra. Medición y reportes claros.',
    eyebrow: 'MARKETING & SEO',
    intro:
      'Trabajamos para que tu negocio aparezca cuando alguien busca lo que vendes y para que la publicidad tenga un retorno medible. El SEO se construye con contenido, técnica y enlaces; la publicidad, con segmentación y seguimiento de resultados. Nada de promesas de primera página en una semana.',
    cardText:
      'Posicionamiento en Google y campañas publicitarias para atraer clientes nuevos y medir resultados.',
    quickFacts: [
      { label: 'Enfoque', value: 'SEO + publicidad' },
      { label: 'Revisión', value: 'Reporte mensual' },
      { label: 'Alcance', value: 'Venezuela y remoto' },
    ],
    includesTitle: 'Qué incluye',
    includes: [
      {
        title: 'Auditoría SEO',
        text: 'Revisamos indexación, velocidad, contenido, enlaces y datos estructurados para detectar lo que frena el crecimiento.',
      },
      {
        title: 'Palabras clave y contenido',
        text: 'Elegimos búsquedas con intención real y planificamos páginas o artículos que las respondan.',
      },
      {
        title: 'Campañas publicitarias',
        text: 'Google Ads, Meta Ads y otras redes, con segmentación, presupuesto y métricas de conversión.',
      },
      {
        title: 'Medición',
        text: 'Instalamos analítica y eventos para saber cuántas consultas, llamadas y ventas genera cada canal.',
      },
    ],
    processTitle: 'Cómo trabajamos',
    process: [
      {
        title: 'Diagnóstico',
        text: 'Revisamos el sitio, la competencia y las búsquedas que importan para tu negocio.',
      },
      {
        title: 'Plan priorizado',
        text: 'Ordenamos las acciones por impacto y esfuerzo, con objetivos y fechas realistas.',
      },
      {
        title: 'Ejecución',
        text: 'Corregimos la base técnica, publicamos contenido y activamos campañas con presupuesto controlado.',
      },
      {
        title: 'Medición y ajuste',
        text: 'Cada mes revisamos posiciones, clics, costo por resultado y consultas recibidas.',
      },
    ],
    useCasesTitle: 'Casos de uso',
    useCases: [
      'Negocios locales que quieren aparecer en Google y Maps.',
      'Tiendas que necesitan campañas con retorno medible.',
      'Empresas nuevas que aún no tienen presencia digital.',
      'Marcas con tráfico que no convierten y necesitan ajustar su embudo.',
    ],
    pricingTitle: 'Cómo se cotiza',
    pricing: [
      'El SEO se cotiza por proyecto de base técnica más una cuota mensual de contenido y enlaces.',
      'La publicidad se cobra por gestión; el presupuesto de anuncios va aparte y lo controla tu empresa.',
      'El precio sube con el número de mercados, idiomas y campañas activas.',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿En cuánto tiempo veré resultados en Google?',
        answer:
          'Las correcciones técnicas pueden reflejarse en días. El posicionamiento orgánico por palabras competidas suele tomar de tres a seis meses, y depende de competencia, contenido y enlaces.',
      },
      {
        question: '¿Garantizan la primera posición?',
        answer:
          'No. Nadie que trabaje de forma legítima puede garantizar el primer puesto: Google no lo vende ni lo promete. Sí garantizamos trabajo medible y reportes honestos.',
      },
      {
        question: '¿Puedo hacer publicidad sin tener web?',
        answer:
          'Se puede enviar tráfico a WhatsApp o a una landing sencilla. Sin una página clara, la conversión suele ser menor y más difícil de medir.',
      },
      {
        question: '¿Cuánto presupuesto necesita una campaña?',
        answer:
          'Depende del sector y de cuántos resultados quieras. Empezamos con un presupuesto de prueba, medimos y escalamos solo lo que funciona.',
      },
      {
        question: '¿Trabajan con negocios fuera de Venezuela?',
        answer:
          'Sí, el marketing y el SEO se ejecutan de forma remota. La publicidad se adapta al país y al público que elijas.',
      },
    ],
    relatedTitle: 'Otros servicios',
    related: ['paginas-web', 'automatizacion-whatsapp', 'desarrollo-de-software'],
    ctaTitle: 'Deja de depender de la suerte para conseguir clientes',
    ctaText:
      'Si tu negocio no aparece cuando buscan lo que vendes, empezamos con una auditoría honesta y un plan priorizado.',
    message: 'Hola Windytech, quiero marketing, SEO y publicidad para mi negocio.',
  },
  },
  {
    id: 'networks',
    path: '/servicios/redes-e-infraestructura/',

    content: {
    slug: 'redes-e-infraestructura',
    icon: 'network',
    title: 'Redes e infraestructura',
    metaTitle: 'Redes e infraestructura para oficinas | Windytech',
    metaDescription:
      'Configuración de redes, WiFi, cableado y servidores para oficinas y locales en Venezuela. Instalación ordenada, documentada y con soporte.',
    eyebrow: 'REDES E INFRAESTRUCTURA',
    intro:
      'Instalamos y ordenamos la red de tu oficina, local o galpón: cableado, WiFi, routers, switches y servidores. El objetivo es simple: que los equipos se conecten sin caídas, que la red sea segura y que cualquiera pueda entender cómo está montada. Servicio presencial en Venezuela.',
    cardText:
      'Configuramos tus equipos en red y la infraestructura de tu local u oficina. Disponible solo en Venezuela.',
    quickFacts: [
      { label: 'Cobertura', value: 'Presencial en Venezuela' },
      { label: 'Alcance', value: 'Oficinas y locales' },
      { label: 'Entrega', value: 'Diagrama y pruebas' },
    ],
    includesTitle: 'Qué incluye',
    includes: [
      {
        title: 'Diagnóstico del espacio',
        text: 'Revisamos metros, paredes, interferencias y cantidad de equipos para diseñar la red correcta.',
      },
      {
        title: 'Cableado y WiFi',
        text: 'Cableado estructurado, puntos de red, access points y cobertura sin zonas muertas.',
      },
      {
        title: 'Equipos y configuración',
        text: 'Routers, switches, servidores y respaldos configurados con contraseñas y accesos documentados.',
      },
      {
        title: 'Seguridad y mantenimiento',
        text: 'Red separada para invitados, control de accesos y revisión periódica de la instalación.',
      },
    ],
    processTitle: 'Cómo trabajamos',
    process: [
      {
        title: 'Visita y levantamiento',
        text: 'Medimos el espacio, contamos equipos y detectamos problemas de cobertura o cableado.',
      },
      {
        title: 'Diseño de la red',
        text: 'Proponemos topología, equipos y puntos de instalación con un presupuesto claro.',
      },
      {
        title: 'Instalación',
        text: 'Ejecutamos el cableado, montamos equipos y configuramos la red por etapas.',
      },
      {
        title: 'Pruebas y entrega',
        text: 'Medimos velocidad y cobertura, probamos fallos y entregamos diagrama y credenciales.',
      },
    ],
    useCasesTitle: 'Casos de uso',
    useCases: [
      'Oficinas que se mudan o amplían sus puestos de trabajo.',
      'Locales con varias cajas y un solo internet inestable.',
      'Galpones y depósitos que necesitan cobertura y control.',
      'Negocios que quieren separar la red de invitados de la red administrativa.',
    ],
    pricingTitle: 'Cómo se cotiza',
    pricing: [
      'El costo depende de metros de cableado, cantidad de puntos y equipos necesarios.',
      'La visita técnica inicial se descuenta si se aprueba la instalación.',
      'El mantenimiento mensual es opcional y se cotiza según el tamaño de la red.',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Trabajan fuera de Venezuela?',
        answer:
          'La instalación física de redes solo se realiza en Venezuela. Para otros países podemos asesorar de forma remota y coordinar con un instalador local.',
      },
      {
        question: '¿Cuánto tarda una instalación?',
        answer:
          'Una oficina pequeña puede resolverse en uno o dos días; un local con cableado nuevo puede tomar una semana o más, según metros y accesos.',
      },
      {
        question: '¿Usan los equipos que ya tengo?',
        answer:
          'Sí, evaluamos routers, switches y access points existentes. Reemplazamos solo lo que no soporta la carga o no es compatible.',
      },
      {
        question: '¿La red queda documentada?',
        answer:
          'Sí. Entregamos diagrama, nombres de red, contraseñas y ubicación de cada equipo.',
      },
      {
        question: '¿Ofrecen soporte después de la instalación?',
        answer:
          'Sí. Ofrecemos visitas de mantenimiento y soporte remoto para cambios de configuración.',
      },
    ],
    relatedTitle: 'Otros servicios',
    related: ['equipos-informaticos', 'desarrollo-de-software', 'paginas-web'],
    ctaTitle: 'Una red estable también es productividad',
    ctaText:
      'Si tu internet se cae, el WiFi no llega o nadie sabe qué cable va a dónde, podemos ordenarlo y dejarlo documentado.',
    message: 'Hola Windytech, quiero cotizar redes e infraestructura.',
  },
  },
  {
    id: 'equipment',
    path: '/servicios/equipos-informaticos/',

    content: {
    slug: 'equipos-informaticos',
    icon: 'monitor',
    title: 'Equipos informáticos',
    metaTitle: 'Equipos informáticos para empresas | Windytech',
    metaDescription:
      'Venta y asesoría de computadoras, impresoras y equipos para oficinas, tiendas y empresas en Venezuela. Configuración y entrega listas para usar.',
    eyebrow: 'EQUIPOS INFORMÁTICOS',
    intro:
      'Asesoramos y vendemos computadoras, impresoras, monitores y accesorios para oficinas, tiendas y empresas en Venezuela. Antes de cobrar, revisamos qué necesita cada puesto de trabajo para no vender de más ni quedarse corto. Los equipos se entregan configurados y listos para usar.',
    cardText:
      'Venta de computadoras y equipos para oficinas, tiendas y empresas, con asesoría para elegir lo que de verdad necesitas.',
    quickFacts: [
      { label: 'Cobertura', value: 'Venezuela' },
      { label: 'Entrega', value: 'Configurado' },
      { label: 'Incluye', value: 'Asesoría previa' },
    ],
    includesTitle: 'Qué incluye',
    includes: [
      {
        title: 'Asesoría por puesto',
        text: 'Definimos procesador, memoria, almacenamiento y pantalla según el uso real de cada persona.',
      },
      {
        title: 'Equipos y accesorios',
        text: 'Computadoras, laptops, impresoras, monitores, redes y periféricos de marcas conocidas.',
      },
      {
        title: 'Configuración inicial',
        text: 'Sistema operativo, programas básicos, correo, impresoras y acceso a la red.',
      },
      {
        title: 'Garantía y soporte',
        text: 'Acompañamiento ante fallas, reposición de partes y soporte durante la garantía.',
      },
    ],
    processTitle: 'Cómo trabajamos',
    process: [
      {
        title: 'Relevamiento',
        text: 'Revisamos cuántos puestos hay, qué programas usan y qué presupuesto manejan.',
      },
      {
        title: 'Propuesta',
        text: 'Presentamos opciones con especificaciones comparables y costo total.',
      },
      {
        title: 'Compra y configuración',
        text: 'Conseguimos los equipos, los probamos y los dejamos listos antes de entregarlos.',
      },
      {
        title: 'Entrega y soporte',
        text: 'Instalamos en sitio si hace falta y damos seguimiento durante la garantía.',
      },
    ],
    useCasesTitle: 'Casos de uso',
    useCases: [
      'Oficinas que renuevan computadoras viejas o lentas.',
      'Tiendas que necesitan un equipo para caja y facturación.',
      'Empresas que montan puestos de trabajo desde cero.',
      'Negocios que necesitan impresoras, escáneres y periféricos compatibles.',
    ],
    pricingTitle: 'Cómo se cotiza',
    pricing: [
      'El precio depende de la configuración y de la disponibilidad del fabricante.',
      'Cotizamos varias opciones para comparar precio, rendimiento y garantía.',
      'La entrega y configuración se incluyen en la compra dentro de la zona acordada.',
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿Venden equipos fuera de Venezuela?',
        answer:
          'La venta y entrega de equipos se realiza en Venezuela. Para otros países podemos asesorar sobre especificaciones y compra local.',
      },
      {
        question: '¿Los equipos tienen garantía?',
        answer:
          'Sí, según el fabricante y el proveedor. La garantía y su alcance se detallan por escrito en la cotización.',
      },
      {
        question: '¿Configuran los equipos antes de entregarlos?',
        answer:
          'Sí. Instalamos sistema operativo, programas básicos, correo e impresoras, y los probamos antes de la entrega.',
      },
      {
        question: '¿Pueden armar una cotización para varios puestos?',
        answer:
          'Sí. Hacemos propuestas por volumen con especificaciones por rol y costo total del proyecto.',
      },
      {
        question: '¿Ofrecen reparación de equipos existentes?',
        answer:
          'Evaluamos el equipo y recomendamos reparar o reemplazar según el costo y la vida útil restante.',
      },
    ],
    relatedTitle: 'Otros servicios',
    related: ['redes-e-infraestructura', 'desarrollo-de-software', 'paginas-web'],
    ctaTitle: 'Compra lo que necesitas, no lo que te ofrecen',
    ctaText:
      'Si vas a equipar una oficina o renovar puestos de trabajo, te ayudamos a comparar sin venderte de más.',
    message: 'Hola Windytech, quiero cotizar equipos informáticos.',
  },
  },
];

/** Ruta de la página del servicio (el sitio es solo en español). */
export function servicePath(service: Service): string {
  return service.path;
}

export function serviceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.content.slug === slug);
}

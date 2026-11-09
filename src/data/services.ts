import type { Lang } from './site';

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
  pathEs: string;
  pathEn: string;
  es: ServiceContent;
  en: ServiceContent;
};

export const serviceHub = {
  es: {
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
  },
  en: {
    path: '/en/services/',
    altPath: '/servicios/',
    title: 'Services | Software, WhatsApp, web, SEO and IT — Windytech',
    description:
      'Windytech services for businesses: custom software, WhatsApp automation, websites, SEO, office networks and IT equipment. Request a quote on WhatsApp.',
    eyebrow: 'SERVICES',
    h1: 'Services that help you sell more and work better',
    intro:
      'Six practices that combine around what your business needs. Hire one or bring them together in a single project: software, WhatsApp, web, marketing, networks and equipment. Every service has its own page with scope, process and FAQs.',
    cta: 'Request a quote',
    ctaTitle: 'Not sure where to start?',
    ctaText:
      'Tell us what your business does and what is slowing it down. We will point you to the right service and what to solve first.',
    labels: {
      includes: 'What is included',
      process: 'How we work',
      useCases: 'Use cases',
      pricing: 'How pricing works',
      faq: 'Frequently asked questions',
      related: 'Other services',
      breadcrumb: 'Breadcrumb',
      home: 'Home',
    },
  },
} as const;

export const services: Service[] = [
  {
    id: 'software',
    pathEs: '/servicios/desarrollo-de-software/',
    pathEn: '/en/services/custom-software-development/',
    es: {
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
    en: {
      slug: 'custom-software-development',
      icon: 'code',
      title: 'Custom software development',
      metaTitle: 'Custom software development | Windytech',
      metaDescription:
        'We build custom systems, dashboards and integrations to organize sales, inventory and operations. Request a quote with clear scope, milestones and timelines.',
      eyebrow: 'CUSTOM SOFTWARE',
      intro:
        'We build web systems, internal dashboards and integrations for companies that can no longer run on spreadsheets, scattered chats and tools that do not talk to each other. We start from your real operation and ship in stages, with a usable version in the first weeks.',
      cardText:
        'Web applications, dashboards, integrations and internal tools designed around the way you work.',
      quickFacts: [
        { label: 'Engagement', value: 'Staged project' },
        { label: 'Delivery', value: 'Remote, with demos' },
        { label: 'Scope', value: 'Agreed before we start' },
      ],
      includesTitle: 'What is included',
      includes: [
        {
          title: 'Process analysis',
          text: 'We review how you sell, collect, manage stock and support customers to find where time or money is lost.',
        },
        {
          title: 'Custom web application',
          text: 'Dashboards, forms, reports and role-based permissions, usable on desktop and mobile.',
        },
        {
          title: 'Integrations',
          text: 'Connections to WhatsApp, payment gateways, banks, invoicing, email and the tools you already use.',
        },
        {
          title: 'Migration and support',
          text: 'We move your current data, train the team and support the first weeks of use.',
        },
      ],
      processTitle: 'How we work',
      process: [
        {
          title: 'Diagnosis',
          text: 'A session to understand the business, the roles and the outcome you need.',
        },
        {
          title: 'Proposal and scope',
          text: 'We agree on modules, timelines, owners and cost before writing code.',
        },
        {
          title: 'Staged development',
          text: 'Every stage ends with a version you can test and use, not an empty demo.',
        },
        {
          title: 'Go live',
          text: 'Data migration, training, adjustments and support to stabilize operations.',
        },
      ],
      useCasesTitle: 'Use cases',
      useCases: [
        'Sales, inventory and cash register systems for stores and hardware shops.',
        'Order, dispatch and customer dashboards for distributors.',
        'Appointments, services and payments for clinics and workshops.',
        'Internal tools for teams currently working with Excel and WhatsApp.',
      ],
      pricingTitle: 'How pricing works',
      pricing: [
        'Cost depends on the number of modules, users and systems that need integration.',
        'We split the project into stages so you can invest and validate step by step.',
        'The quote includes written scope, deliverables, timelines and payment terms.',
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        {
          question: 'How much does custom software cost?',
          answer:
            'It depends on scope. A single module is not the same as a full system with inventory, invoicing and reports. After the diagnosis we provide a fixed quote per stage, with no surprise costs.',
        },
        {
          question: 'How long does development take?',
          answer:
            'A small module can be ready in a few weeks; a complete system is usually built in stages over several months. We prefer partial releases over a single launch at the end.',
        },
        {
          question: 'Can I keep my current system and add modules?',
          answer:
            'Yes, if the system supports integrations or database access. If not, we evaluate replacing it in parts so operations never stop.',
        },
        {
          question: 'Do I own the software?',
          answer:
            'Yes. The code and project data belong to your company, with access and backup documentation.',
        },
        {
          question: 'Do you provide support after delivery?',
          answer:
            'Yes. We offer monthly support and maintenance to fix issues, update dependencies and add improvements.',
        },
      ],
      relatedTitle: 'Other services',
      related: ['whatsapp-automation', 'web-design', 'networks-infrastructure'],
      ctaTitle: 'Tell us what you need to automate',
      ctaText:
        'If your operation depends on Excel, paper or scattered messages, we can help you organize it with custom software.',
      message:
        'Hello Windytech, I would like a quote for custom software development.',
    },
  },
  {
    id: 'whatsapp',
    pathEs: '/servicios/automatizacion-whatsapp/',
    pathEn: '/en/services/whatsapp-automation/',
    es: {
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
    en: {
      slug: 'whatsapp-automation',
      icon: 'chat',
      title: 'WhatsApp automation',
      metaTitle: 'WhatsApp Business automation | Windytech',
      metaDescription:
        'WhatsApp bots and automatic replies to answer customers, take orders and book appointments. Setup, training and ongoing review with Windytech.',
      eyebrow: 'WHATSAPP AUTOMATION',
      intro:
        'We set up a WhatsApp assistant that answers common questions, takes orders and books appointments without your team glued to the phone. It is not a rigid bot: it is designed around your replies, prices and service style, and hands over to a person when needed.',
      cardText:
        'Chatbots and automatic replies that answer customers, take orders and book appointments without staying glued to the phone.',
      quickFacts: [
        { label: 'Channel', value: 'WhatsApp Business' },
        { label: 'Setup', value: '2 to 4 weeks' },
        { label: 'Languages', value: 'Spanish and English' },
      ],
      includesTitle: 'What is included',
      includes: [
        {
          title: 'Conversation flows',
          text: 'Replies to the questions your customers actually ask: pricing, hours, stock, shipping and payment methods.',
        },
        {
          title: 'Order taking',
          text: 'Customers choose products, confirm quantities and leave their details without leaving the chat.',
        },
        {
          title: 'Booking and reminders',
          text: 'Appointment booking with confirmation and automatic reminders to reduce no-shows.',
        },
        {
          title: 'Human handover when it matters',
          text: 'The bot transfers the conversation to a person for complaints, complex cases or when the customer asks.',
        },
      ],
      processTitle: 'How we work',
      process: [
        {
          title: 'Conversation map',
          text: 'We review your current messages and define what can be answered automatically and what needs a person.',
        },
        {
          title: 'Flow design',
          text: 'We write replies, menus and rules in your brand voice and validate them with you.',
        },
        {
          title: 'Implementation',
          text: 'We connect the number, test real cases and adjust before opening it to customers.',
        },
        {
          title: 'Measurement and improvement',
          text: 'We review conversations and unanswered questions to expand the flow every month.',
        },
      ],
      useCasesTitle: 'Use cases',
      useCases: [
        'Stores that receive orders and price questions on WhatsApp.',
        'Clinics, salons and workshops that book appointments by chat.',
        'Restaurants with menus, orders and automatic confirmations.',
        'Sales teams that need to qualify leads before calling them.',
      ],
      pricingTitle: 'How pricing works',
      pricing: [
        'Price depends on the number of flows, products and connected systems.',
        'Setup is a one-time fee; monthly maintenance is optional.',
        'Official WhatsApp API fees are paid by the company and quoted separately.',
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        {
          question: 'Is automating WhatsApp allowed?',
          answer:
            'Yes, when you use the official WhatsApp Business API and customers start or accept the conversation. We do not work with bulk blasting or unauthorized personal numbers.',
        },
        {
          question: 'Does the bot replace my team?',
          answer:
            'No. It handles repetitive questions and simple orders; when a case is sensitive or the customer asks, it hands over to a person.',
        },
        {
          question: 'Can I keep my current number?',
          answer:
            'Yes, if we migrate the number to the official API. We explain what changes and how to keep the conversation history.',
        },
        {
          question: 'Can I send bulk messages?',
          answer:
            'Only to customers who opted in and with templates approved by Meta. Bulk sending without consent is not allowed.',
        },
        {
          question: 'What if the bot does not understand?',
          answer:
            'The flow includes a clear exit: it asks for clarification once and then hands over to a person, so the customer is never stuck.',
        },
      ],
      relatedTitle: 'Other services',
      related: ['custom-software-development', 'web-design', 'seo-marketing'],
      ctaTitle: 'Stop answering the same thing all day',
      ctaText:
        'If your WhatsApp receives the same questions, orders and bookings every day, a well-designed assistant gives you hours back.',
      message: 'Hello Windytech, I want to automate my WhatsApp Business.',
    },
  },
  {
    id: 'web',
    pathEs: '/servicios/paginas-web/',
    pathEn: '/en/services/web-design/',
    es: {
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
    en: {
      slug: 'web-design',
      icon: 'layout',
      title: 'Landing pages and websites',
      metaTitle: 'Business website design | Windytech',
      metaDescription:
        'Fast, clear, mobile-ready websites and landing pages designed to turn visitors into messages and sales. Built and launched by Windytech.',
      eyebrow: 'WEB DESIGN & DEVELOPMENT',
      intro:
        'We build fast, clear, mobile-ready websites designed so visitors understand what you sell and message you or buy. We do not hand over templates without thinking: we define structure, copy, speed and contact points before designing.',
      cardText:
        'Fast, clear, mobile-ready websites designed so visitors message you or buy from you.',
      quickFacts: [
        { label: 'Type', value: 'Landing or full site' },
        { label: 'Delivery', value: '2 to 6 weeks' },
        { label: 'Includes', value: 'Domain and email' },
      ],
      includesTitle: 'What is included',
      includes: [
        {
          title: 'Structure and copy',
          text: 'We define sections, messages and calls to action based on what your customer is looking for.',
        },
        {
          title: 'Custom design',
          text: 'An interface aligned with your brand, readable on mobile and free of distractions from contact.',
        },
        {
          title: 'Speed and technical SEO',
          text: 'Optimized images, semantic HTML, metadata, sitemap and structured data.',
        },
        {
          title: 'Launch and email',
          text: 'We configure domain, hosting, SSL and a professional email account if you need one.',
        },
      ],
      processTitle: 'How we work',
      process: [
        {
          title: 'Briefing',
          text: 'We understand the business, the audience and the action you want the page to produce.',
        },
        {
          title: 'Visual proposal',
          text: 'We present structure and design before coding so changes happen without rework.',
        },
        {
          title: 'Development',
          text: 'We build the page, test it on mobile and desktop and measure its speed.',
        },
        {
          title: 'Launch and training',
          text: 'We go live, connect the form or WhatsApp and show you how to edit it.',
        },
      ],
      useCasesTitle: 'Use cases',
      useCases: [
        'Landing page for an ad campaign or a launch.',
        'Corporate site with services, team and contact.',
        'Booking or ordering page connected to WhatsApp.',
        'Professional portfolio for consultants and studios.',
      ],
      pricingTitle: 'How pricing works',
      pricing: [
        'A single-section landing page costs less than a multi-page site.',
        'The price includes design, development, launch and one round of adjustments.',
        'Domain, hosting and email are quoted based on the provider you choose.',
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        {
          question: 'How long does a website take?',
          answer:
            'A landing page usually takes two to three weeks; a multi-page site, four to six. The clock starts when we have copy and materials.',
        },
        {
          question: 'Do you write the copy?',
          answer:
            'Yes. We can write it from an interview, or adapt what you already have so it is clear and useful for search engines.',
        },
        {
          question: 'Will the website be mine?',
          answer:
            'Yes. Domain, hosting and code are registered to your name, with documented access.',
        },
        {
          question: 'Does it include Google ranking?',
          answer:
            'It includes the technical base: speed, metadata, sitemap and structured data. Sustained ranking is separate work involving content and links.',
        },
        {
          question: 'Can I update the page myself?',
          answer:
            'Yes. If you need to edit copy and prices often, we include an editable section and train you on it.',
        },
      ],
      relatedTitle: 'Other services',
      related: ['seo-marketing', 'whatsapp-automation', 'custom-software-development'],
      ctaTitle: 'Your website should sell, not just exist',
      ctaText:
        'If you already have a site that generates no inquiries, we review it and propose a structure that converts.',
      message: 'Hello Windytech, I would like a quote for a website or landing page.',
    },
  },
  {
    id: 'marketing',
    pathEs: '/servicios/marketing-seo/',
    pathEn: '/en/services/seo-marketing/',
    es: {
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
    en: {
      slug: 'seo-marketing',
      icon: 'chart',
      title: 'Marketing, SEO and advertising',
      metaTitle: 'SEO and digital marketing | Windytech',
      metaDescription:
        'Google ranking, technical SEO and ad campaigns that attract customers with real buying intent. Clear measurement and honest reporting.',
      eyebrow: 'MARKETING & SEO',
      intro:
        'We work so your business shows up when someone searches for what you sell, and so advertising has a measurable return. SEO is built with content, technical health and links; advertising with targeting and result tracking. No promises of a first-page ranking in one week.',
      cardText:
        'Google ranking and ad campaigns that bring in new customers and show measurable results.',
      quickFacts: [
        { label: 'Focus', value: 'SEO + advertising' },
        { label: 'Reporting', value: 'Monthly report' },
        { label: 'Scope', value: 'Venezuela and remote' },
      ],
      includesTitle: 'What is included',
      includes: [
        {
          title: 'SEO audit',
          text: 'We review indexing, speed, content, links and structured data to find what is blocking growth.',
        },
        {
          title: 'Keywords and content',
          text: 'We choose searches with real intent and plan pages or articles that answer them.',
        },
        {
          title: 'Ad campaigns',
          text: 'Google Ads, Meta Ads and other networks, with targeting, budget and conversion metrics.',
        },
        {
          title: 'Measurement',
          text: 'We install analytics and events to know how many inquiries, calls and sales each channel produces.',
        },
      ],
      processTitle: 'How we work',
      process: [
        {
          title: 'Diagnosis',
          text: 'We review your site, competitors and the searches that matter to your business.',
        },
        {
          title: 'Prioritized plan',
          text: 'We order actions by impact and effort, with realistic goals and dates.',
        },
        {
          title: 'Execution',
          text: 'We fix the technical base, publish content and launch campaigns with controlled budgets.',
        },
        {
          title: 'Measurement and adjustment',
          text: 'Each month we review rankings, clicks, cost per result and inquiries received.',
        },
      ],
      useCasesTitle: 'Use cases',
      useCases: [
        'Local businesses that want to appear on Google and Maps.',
        'Stores that need campaigns with measurable return.',
        'New companies with no digital presence yet.',
        'Brands with traffic that does not convert and need funnel fixes.',
      ],
      pricingTitle: 'How pricing works',
      pricing: [
        'SEO is quoted as a technical foundation project plus a monthly content and link fee.',
        'Advertising is charged per management; the ad budget is separate and controlled by your company.',
        'Price increases with the number of markets, languages and active campaigns.',
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        {
          question: 'How long until I see results on Google?',
          answer:
            'Technical fixes can show up in days. Organic ranking for competitive keywords usually takes three to six months and depends on competition, content and links.',
        },
        {
          question: 'Do you guarantee the first position?',
          answer:
            'No. Nobody working legitimately can guarantee first place: Google does not sell or promise it. We do guarantee measurable work and honest reporting.',
        },
        {
          question: 'Can I advertise without a website?',
          answer:
            'You can send traffic to WhatsApp or a simple landing page. Without a clear page, conversion is usually lower and harder to measure.',
        },
        {
          question: 'How much budget does a campaign need?',
          answer:
            'It depends on the industry and how many results you want. We start with a test budget, measure, and scale only what works.',
        },
        {
          question: 'Do you work with businesses outside Venezuela?',
          answer:
            'Yes, marketing and SEO are delivered remotely. Advertising adapts to the country and audience you choose.',
        },
      ],
      relatedTitle: 'Other services',
      related: ['web-design', 'whatsapp-automation', 'custom-software-development'],
      ctaTitle: 'Stop relying on luck to find customers',
      ctaText:
        'If your business does not show up when people search for what you sell, we start with an honest audit and a prioritized plan.',
      message: 'Hello Windytech, I want marketing, SEO and advertising for my business.',
    },
  },
  {
    id: 'networks',
    pathEs: '/servicios/redes-e-infraestructura/',
    pathEn: '/en/services/networks-infrastructure/',
    es: {
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
    en: {
      slug: 'networks-infrastructure',
      icon: 'network',
      title: 'Networks and infrastructure',
      metaTitle: 'Office networks and IT infrastructure | Windytech',
      metaDescription:
        'Network, WiFi, cabling and server setup for offices and stores in Venezuela. Clean, documented installation with ongoing support.',
      eyebrow: 'NETWORKS & INFRASTRUCTURE',
      intro:
        'We install and organize the network of your office, store or warehouse: cabling, WiFi, routers, switches and servers. The goal is simple: devices connect without drops, the network is secure, and anyone can understand how it is built. On-site service in Venezuela.',
      cardText:
        'We set up your network and office infrastructure. Available in Venezuela only.',
      quickFacts: [
        { label: 'Coverage', value: 'On-site in Venezuela' },
        { label: 'Scope', value: 'Offices and stores' },
        { label: 'Delivery', value: 'Diagram and tests' },
      ],
      includesTitle: 'What is included',
      includes: [
        {
          title: 'Site assessment',
          text: 'We review size, walls, interference and device count to design the right network.',
        },
        {
          title: 'Cabling and WiFi',
          text: 'Structured cabling, network points, access points and coverage without dead zones.',
        },
        {
          title: 'Equipment and configuration',
          text: 'Routers, switches, servers and backups configured with documented passwords and access.',
        },
        {
          title: 'Security and maintenance',
          text: 'Separate guest network, access control and periodic review of the installation.',
        },
      ],
      processTitle: 'How we work',
      process: [
        {
          title: 'Visit and survey',
          text: 'We measure the space, count devices and detect coverage or cabling problems.',
        },
        {
          title: 'Network design',
          text: 'We propose topology, equipment and installation points with a clear budget.',
        },
        {
          title: 'Installation',
          text: 'We run cabling, mount equipment and configure the network in stages.',
        },
        {
          title: 'Testing and handover',
          text: 'We measure speed and coverage, test failures and deliver the diagram and credentials.',
        },
      ],
      useCasesTitle: 'Use cases',
      useCases: [
        'Offices that are moving or adding workstations.',
        'Stores with several registers and a single unstable connection.',
        'Warehouses that need coverage and access control.',
        'Businesses that want to separate guest and administrative networks.',
      ],
      pricingTitle: 'How pricing works',
      pricing: [
        'Cost depends on cabling length, number of points and equipment required.',
        'The initial technical visit is credited if the installation is approved.',
        'Monthly maintenance is optional and quoted by network size.',
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        {
          question: 'Do you work outside Venezuela?',
          answer:
            'Physical network installation is only available in Venezuela. For other countries we can advise remotely and coordinate with a local installer.',
        },
        {
          question: 'How long does an installation take?',
          answer:
            'A small office can be done in one or two days; a store with new cabling may take a week or more, depending on length and access.',
        },
        {
          question: 'Do you use the equipment I already have?',
          answer:
            'Yes, we assess existing routers, switches and access points. We replace only what cannot handle the load or is incompatible.',
        },
        {
          question: 'Is the network documented?',
          answer:
            'Yes. We deliver a diagram, network names, passwords and the location of every device.',
        },
        {
          question: 'Do you offer support after installation?',
          answer:
            'Yes. We offer maintenance visits and remote support for configuration changes.',
        },
      ],
      relatedTitle: 'Other services',
      related: ['it-equipment', 'custom-software-development', 'web-design'],
      ctaTitle: 'A stable network is productivity too',
      ctaText:
        'If your internet drops, WiFi does not reach or nobody knows which cable goes where, we can organize it and document it.',
      message: 'Hello Windytech, I would like a quote for networks and infrastructure.',
    },
  },
  {
    id: 'equipment',
    pathEs: '/servicios/equipos-informaticos/',
    pathEn: '/en/services/it-equipment/',
    es: {
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
    en: {
      slug: 'it-equipment',
      icon: 'monitor',
      title: 'IT equipment',
      metaTitle: 'IT equipment for businesses | Windytech',
      metaDescription:
        'Computers, printers and IT equipment for offices, stores and companies in Venezuela. Advice, setup and delivery ready to use.',
      eyebrow: 'IT EQUIPMENT',
      intro:
        'We advise and sell computers, printers, monitors and accessories for offices, stores and companies in Venezuela. Before charging, we review what each workstation actually needs so you do not overbuy or fall short. Equipment is delivered configured and ready to use.',
      cardText:
        'Computers and equipment for offices, stores and companies, with advice to choose what you actually need.',
      quickFacts: [
        { label: 'Coverage', value: 'Venezuela' },
        { label: 'Delivery', value: 'Configured' },
        { label: 'Includes', value: 'Prior advice' },
      ],
      includesTitle: 'What is included',
      includes: [
        {
          title: 'Per-workstation advice',
          text: 'We define processor, memory, storage and screen based on each person real use.',
        },
        {
          title: 'Equipment and accessories',
          text: 'Computers, laptops, printers, monitors, networking gear and peripherals from known brands.',
        },
        {
          title: 'Initial setup',
          text: 'Operating system, basic software, email, printers and network access.',
        },
        {
          title: 'Warranty and support',
          text: 'Help with failures, part replacement and support during the warranty period.',
        },
      ],
      processTitle: 'How we work',
      process: [
        {
          title: 'Survey',
          text: 'We review how many workstations there are, which software you use and your budget.',
        },
        {
          title: 'Proposal',
          text: 'We present options with comparable specifications and total cost.',
        },
        {
          title: 'Purchase and setup',
          text: 'We source the equipment, test it and leave it ready before delivery.',
        },
        {
          title: 'Delivery and support',
          text: 'We install on site if needed and follow up during the warranty.',
        },
      ],
      useCasesTitle: 'Use cases',
      useCases: [
        'Offices replacing old or slow computers.',
        'Stores that need a register and invoicing machine.',
        'Companies setting up workstations from scratch.',
        'Businesses that need compatible printers, scanners and peripherals.',
      ],
      pricingTitle: 'How pricing works',
      pricing: [
        'Price depends on configuration and manufacturer availability.',
        'We quote several options to compare price, performance and warranty.',
        'Delivery and setup are included in the purchase within the agreed area.',
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        {
          question: 'Do you sell equipment outside Venezuela?',
          answer:
            'Equipment sales and delivery happen in Venezuela. For other countries we can advise on specifications and local purchase.',
        },
        {
          question: 'Does the equipment include a warranty?',
          answer:
            'Yes, according to the manufacturer and supplier. Warranty and its scope are detailed in writing in the quote.',
        },
        {
          question: 'Do you configure devices before delivery?',
          answer:
            'Yes. We install the operating system, basic software, email and printers, and test everything before delivery.',
        },
        {
          question: 'Can you quote for several workstations?',
          answer:
            'Yes. We prepare volume proposals with specifications by role and total project cost.',
        },
        {
          question: 'Do you repair existing equipment?',
          answer:
            'We assess the device and recommend repair or replacement based on cost and remaining useful life.',
        },
      ],
      relatedTitle: 'Other services',
      related: ['networks-infrastructure', 'custom-software-development', 'web-design'],
      ctaTitle: 'Buy what you need, not what you are sold',
      ctaText:
        'If you are equipping an office or renewing workstations, we help you compare without overselling.',
      message: 'Hello Windytech, I would like a quote for IT equipment.',
    },
  },
];

export function servicePath(lang: Lang, service: Service): string {
  return lang === 'es' ? service.pathEs : service.pathEn;
}

export function serviceAlternatePath(lang: Lang, service: Service): string {
  return lang === 'es' ? service.pathEn : service.pathEs;
}

export function serviceBySlug(lang: Lang, slug: string): Service | undefined {
  return services.find((service) => service[lang].slug === slug);
}

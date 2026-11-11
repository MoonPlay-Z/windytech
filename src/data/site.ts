export const site = {
  name: 'Windytech',
  legalName: 'Windytech',
  /* Nombre anterior de la marca: alias para buscadores, nunca nombre principal. */
  alternateName: ['Windy Tech'] as string[],
  slogan: 'Desarrollo de software, automatización de WhatsApp y marketing digital',
  url: 'https://windytech.studio',
  domain: 'windytech.studio',
  whatsappNumber: '584127723148',
  whatsappDisplay: '+58 412-7723148',
  email: 'windytechestudio@gmail.com',
  year: 2026,
  ogImage: '/assets/og.png',
  logo: '/assets/logo-square.png',
  // Fecha de referencia para datos estructurados. Ajusta si la empresa existe desde antes.
  foundingDate: '2026',
  contentUpdated: '2026-11-09',
  address: {
    country: 'VE',
    countryName: 'Venezuela',
    /* Rellenar solo con una ciudad/estado reales; si están vacíos no se publican. */
    locality: '',
    region: '',
  },
  /* Cuenta de X/Twitter oficial (@usuario) cuando exista. */
  twitter: '',
  areaServed: ['Venezuela', 'Worldwide'],
  currenciesAccepted: 'USD',
  paymentAccepted: 'Binance, PayPal',
  /*
   * Enlaces oficiales de la empresa (Instagram, LinkedIn, Facebook, Google Business
   * Profile, Bing Places, GitHub...). Añadirlos aquí refuerza la entidad de marca
   * que Google y Bing usan para mostrar el panel "Acerca de".
   */
  sameAs: [] as string[],
  /*
   * Códigos de verificación de los buscadores. Se pegan tal cual los entrega cada
   * consola y la etiqueta <meta> solo se renderiza cuando el valor no está vacío.
   */
  verification: {
    google: 'de7be1f2-4139-4e1c-8932-3fcb990ee688',
    bing: '1A53073E9F99FBDBD7E6229B2FCBB9B2',
    yandex: '',
  },
};

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const content = {
  meta: {
    homeTitle: 'Windytech | Software a medida, WhatsApp y páginas web',
    homeDescription:
      'Desarrollo de software a medida, automatización de WhatsApp, webs y SEO para empresas. Servicios digitales remotos y soporte de redes en Venezuela.',
    homeOgAlt: 'Windytech — Desarrollo de software, automatización y marketing',
  },
  nav: {
    home: 'Inicio',
    items: [
      { label: 'Inicio', href: '#inicio' },
      { label: 'Servicios', href: '/servicios/' },
      { label: 'Catálogo', href: '/catalogo/' },
      { label: 'Proyectos', href: '/proyectos/' },
      { label: 'Blog', href: '/blog/' },
      { label: 'Contacto', href: '#contacto' },
    ],
    cta: 'Pedir cotización por WhatsApp',
    headerCta: 'Cuéntanos sobre tu proyecto',
    menu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    about: 'Acerca de Windytech',
    aboutHref: '/nosotros/',
  },
  campaignBar: {
    label: 'CAMPAÑA ACTIVA',
    text: 'Landing page + bot de WhatsApp para tu negocio',
    link: 'Ver campañas',
  },
  whatsapp: {
    general: 'Hola Windytech, quiero una cotización.',
    floatLabel: 'Escríbenos por WhatsApp',
    campaign: 'Hola Windytech, vengo de la campaña ',
  },
  hero: {
    badge: 'Windytech · Desarrollo & Automatización',
    titleBefore: 'Desarrollo de software,',
    titleHighlight: 'WhatsApp y páginas web',
    description:
      'Desarrollamos software a medida, automatizamos tu WhatsApp y creamos webs que convierten visitas en clientes. Marketing, SEO y equipos informáticos para empresas que quieren crecer.',
    bullets: [
      'Software a medida y automatizaciones para tu operación',
      'Webs y landing pages que convierten visitas en clientes',
      'Pagos internacionales con Binance y PayPal',
    ],
    primaryCta: 'Hablar por WhatsApp',
    secondaryCta: 'Ver servicios',
    panelTitle: '¿Qué necesitas hoy?',
    panelSubtitle: 'Elige un servicio y te respondemos por WhatsApp.',
    quickLinks: [
      {
        label: 'Desarrollo de software',
        icon: 'code',
        href: '/servicios/desarrollo-de-software/',
        message: 'Hola Windytech, quiero desarrollar software a medida para mi negocio.',
      },
      {
        label: 'Automatización de WhatsApp',
        icon: 'chat',
        href: '/servicios/automatizacion-whatsapp/',
        message: 'Hola Windytech, quiero automatizar mi WhatsApp.',
      },
      {
        label: 'Landing page o sitio web',
        icon: 'layout',
        href: '/servicios/paginas-web/',
        message: 'Hola Windytech, quiero una landing page o un sitio web.',
      },
      {
        label: 'Marketing, SEO y publicidad',
        icon: 'chart',
        href: '/servicios/marketing-seo/',
        message: 'Hola Windytech, quiero marketing, SEO y publicidad para mi negocio.',
      },
      {
        label: 'Equipos informáticos',
        icon: 'monitor',
        href: '/servicios/equipos-informaticos/',
      },
    ],
    panelFooter: [
      { label: 'WhatsApp', icon: 'whatsapp' },
      { label: 'Web y SEO', icon: 'globe' },
      { label: 'Equipos', icon: 'monitor' },
    ],
  },
  campaigns: {
    eyebrow: 'CAMPAÑAS WINDY TECH',
    title: 'Elige la campaña que necesita tu negocio',
    subtitle:
      'Cada campaña abre un chat de WhatsApp con su nombre. Al responderte, te contamos la promoción vigente.',
    cards: [
      {
        tag: 'Software a medida',
        icon: 'code',
        title: 'Un sistema que trabaja como tu negocio',
        text: 'Diseñamos y desarrollamos herramientas, paneles e integraciones para ordenar tu operación.',
        cta: 'Quiero mi sistema',
        message: 'Hola Windytech, vengo de la campaña Software a medida',
      },
      {
        tag: 'WhatsApp 24/7',
        icon: 'bot',
        title: 'Atiende a tus clientes sin parar',
        text: 'Un asistente automático responde, toma pedidos y agenda citas mientras tú trabajas.',
        cta: 'Quiero mi asistente',
        message: 'Hola Windytech, vengo de la campaña WhatsApp 24/7',
      },
      {
        tag: 'Página web',
        icon: 'layout',
        title: 'Tu landing page lista para vender',
        text: 'Una página clara, rápida y con botón directo a tu WhatsApp para convertir visitas en clientes.',
        cta: 'Quiero mi página',
        message: 'Hola Windytech, vengo de la campaña Página web',
      },
      {
        tag: 'Marketing y SEO',
        icon: 'chart',
        title: 'Atrae clientes nuevos cada semana',
        text: 'Posicionamiento en Google y publicidad para que más personas encuentren tu negocio.',
        cta: 'Quiero más clientes',
        message: 'Hola Windytech, vengo de la campaña Marketing y SEO',
      },
    ],
  },
  services: {
    title: 'Nuestros servicios',
    subtitle:
      'Todo lo que tu negocio necesita para vender más y trabajar mejor, en un solo equipo.',
    cta: 'Cotizar este servicio',
    cards: [
      {
        icon: 'code',
        title: 'Desarrollo de software a medida',
        text: 'Aplicaciones web, paneles, integraciones y herramientas internas diseñadas para tu forma de trabajar.',
        message: 'Hola Windytech, quiero cotizar desarrollo de software a medida.',
      },
      {
        icon: 'chat',
        title: 'Automatización de WhatsApp',
        text: 'Chatbots y respuestas automáticas para atender clientes, tomar pedidos y agendar citas sin que tu equipo esté pegado al teléfono.',
        message: 'Hola Windytech, quiero cotizar automatización de WhatsApp.',
      },
      {
        icon: 'layout',
        title: 'Landing pages y sitios web',
        text: 'Diseño y desarrollo de páginas rápidas, claras y listas para celular, pensadas para que el visitante te escriba o te compre.',
        message: 'Hola Windytech, quiero cotizar una landing page o sitio web.',
      },
      {
        icon: 'chart',
        title: 'Marketing, SEO y publicidad',
        text: 'Posicionamiento en Google y campañas publicitarias para atraer clientes nuevos y medir resultados.',
        message: 'Hola Windytech, quiero cotizar marketing, SEO y publicidad.',
      },
      {
        icon: 'network',
        title: 'Redes e infraestructura',
        text: 'Configuramos tus equipos en red y la infraestructura de tu local u oficina. Disponible solo en Venezuela.',
        message: 'Hola Windytech, quiero cotizar configuración de redes e infraestructura.',
      },
      {
        icon: 'monitor',
        title: 'Equipos informáticos',
        text: 'Venta de computadoras y equipos para oficinas, tiendas y empresas, con asesoría para elegir lo que de verdad necesitas.',
        message: 'Hola Windytech, quiero cotizar equipos informáticos.',
      },
    ],
  },
  share: {
    label: '¿Te resultó útil? Comparte Windytech',
    navLabel: 'Compartir esta página',
    whatsapp: 'Compartir por WhatsApp',
    facebook: 'Compartir en Facebook',
    linkedin: 'Compartir en LinkedIn',
    copy: 'Copiar enlace',
    copied: 'Enlace copiado',
    copyError: 'No se pudo copiar. Copia la dirección desde el navegador.',
  },
  clients: {
    title: 'Trabajamos con negocios de todos los tamaños',
    text: 'Desde un emprendimiento que arranca hasta una empresa con varias sedes. Ajustamos el servicio a tu etapa y a tu presupuesto.',
    bullets: [
      {
        title: 'Precios claros',
        text: 'Te decimos cuánto cuesta antes de empezar.',
      },
      {
        title: 'Atención directa',
        text: 'Hablas con el equipo que hace el trabajo.',
      },
      {
        title: 'Todo en un solo lugar',
        text: 'Web, WhatsApp, marketing y equipos con un solo proveedor.',
      },
    ],
    segments: [
      {
        label: 'PEQUEÑAS EMPRESAS',
        text: 'Una página web profesional, un bot de WhatsApp y publicidad para conseguir tus primeros clientes en línea.',
      },
      {
        label: 'MEDIANAS EMPRESAS',
        text: 'Automatización de ventas y atención, SEO constante y software para ordenar tu operación mientras creces.',
      },
      {
        label: 'GRANDES EMPRESAS',
        text: 'Equipo de marketing dedicado, campañas a gran escala, equipamiento informático y automatizaciones a medida.',
      },
    ],
  },
  equipment: {
    eyebrow: 'EQUIPOS INFORMÁTICOS',
    title: 'Catálogo en preparación',
    text: 'Estamos preparando el catálogo con precios y disponibilidad. Mientras tanto, cuéntanos qué equipo necesitas y te cotizamos.',
    bullets: [
      'Laptops y computadoras de escritorio',
      'Monitores, impresoras y accesorios',
      'Redes y conectividad para tu local',
      'Asesoría para importar o exportar equipos',
    ],
    cta: 'Cotizar equipo por WhatsApp',
    message: 'Hola Windytech, quiero cotizar un equipo informático.',
    note: 'Te confirmamos disponibilidad, precio y tiempo de entrega al cotizar.',
  },
  payments: {
    title: 'Medios de pago',
    text: 'Pagas de forma segura desde cualquier país con las plataformas que ya usas.',
    methods: ['Binance', 'PayPal'],
    note: 'Al aceptar tu cotización te enviamos los datos para pagar.',
  },
  cta: {
    title: '¿Listo para automatizar tu negocio?',
    text: 'Escríbenos y recibe tu cotización por WhatsApp. Aceptamos Binance y PayPal.',
    button: 'Inicia tu proyecto por WhatsApp',
  },
  faqs: {
    eyebrow: 'PREGUNTAS FRECUENTES',
    title: 'Respuestas sobre nuestros servicios',
    subtitle: 'Conoce qué hacemos, cómo trabajamos y cómo pedir una cotización.',
    items: [
      {
        question: '¿Qué es Windytech y a qué se dedica?',
        answer:
          'Windytech es un estudio de desarrollo de software, automatización de WhatsApp, diseño web y marketing digital con base en Venezuela. Ayuda a empresas de cualquier país a vender más y trabajar mejor con soluciones digitales a la medida.',
      },
      {
        question: '¿Dónde está ubicada Windytech?',
        answer:
          'Windytech tiene su base en Venezuela y atiende proyectos digitales de forma remota en cualquier país. La instalación de redes, la infraestructura y la entrega física de equipos se coordinan únicamente en Venezuela.',
      },
      {
        question: '¿Qué servicios digitales ofrece Windytech?',
        answer:
          'Desarrollamos software a medida y aplicaciones web, automatizamos WhatsApp Business, diseñamos páginas web y landing pages, y ofrecemos SEO, marketing digital, publicidad, redes e infraestructura y equipos informáticos.',
      },
      {
        question: '¿Cuánto cuesta una página web o un software a medida?',
        answer:
          'El precio depende del alcance, las funciones y las integraciones que necesite tu negocio. Cuéntanos tu objetivo y te enviaremos una cotización antes de comenzar.',
      },
      {
        question: '¿Pueden automatizar WhatsApp Business para pedidos o citas?',
        answer:
          'Sí. Podemos ayudarte a automatizar respuestas y flujos de atención para consultas, pedidos o citas. Revisamos tu proceso y definimos el alcance contigo antes de cotizar.',
      },
      {
        question: '¿Ofrecen posicionamiento SEO y marketing digital?',
        answer:
          'Sí. Trabajamos en optimización para buscadores, contenido y campañas publicitarias según los objetivos del negocio. El posicionamiento depende de factores como la competencia, el sitio y la demanda; no prometemos posiciones ni resultados garantizados.',
      },
      {
        question: '¿Trabajan con empresas fuera de Venezuela?',
        answer:
          'Podemos atender proyectos digitales de forma remota para clientes en otros países. Los servicios de instalación de redes e infraestructura están disponibles únicamente en Venezuela.',
      },
      {
        question: '¿Cómo solicito una cotización?',
        answer:
          'Escríbenos por WhatsApp o usa el formulario de contacto. Indica el servicio, qué necesitas resolver y cómo podemos contactarte para preparar una cotización.',
      },
    ],
  },
  contact: {
    eyebrow: 'CONTACTO',
    title: 'Hablemos de tu proyecto',
    text: 'Cuéntanos qué necesitas y te enviamos una cotización por WhatsApp.',
    cards: [
      { label: 'WHATSAPP', value: site.whatsappDisplay, href: `https://wa.me/${site.whatsappNumber}`, icon: 'whatsapp' },
      { label: 'CORREO', value: site.email, href: `mailto:${site.email}`, icon: 'mail' },
      { label: 'SITIO WEB', value: site.domain, href: site.url, icon: 'globe' },
      {
        label: 'COBERTURA',
        value: 'Servicios digitales para cualquier país. Redes e infraestructuras solo en Venezuela.',
        icon: 'globe',
      },
    ],
    form: {
      name: 'Nombre',
      namePlaceholder: 'Tu nombre',
      business: 'Negocio',
      businessPlaceholder: 'Nombre de tu negocio (opcional)',
      service: 'Servicio de interés',
      message: 'Mensaje',
      messagePlaceholder: 'Cuéntanos qué necesitas',
      submit: 'Enviar por WhatsApp',
      note: 'Al enviar, se abrirá WhatsApp con tu mensaje listo para enviar.',
      emailFallback: '¿Prefieres correo? Escríbenos a',
      options: [
        'Desarrollo de software',
        'Automatización de WhatsApp',
        'Landing page o sitio web',
        'Marketing, SEO y publicidad',
        'Redes e infraestructura',
        'Equipos informáticos',
        'Otro',
      ],
    },
  },
  footer: {
    tagline: 'DESARROLLO & AUTOMATIZACIÓN',
    rights: 'Todos los derechos reservados.',
    privacy: 'Privacidad',
    terms: 'Términos',
    legalPaths: {
      privacy: '/legal/privacidad',
      terms: '/legal/terminos',
    },
  },
} as const;

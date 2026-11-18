import { company, sameAsProfiles } from './empresa';

export const site = {
  name: company.name,
  legalName: company.legalName,
  /* Alias y grafías alternativas: los buscadores agrupan la entidad con ellos. */
  alternateName: company.alternateNames,
  slogan: company.slogan,
  url: 'https://windytech.studio',
  domain: 'windytech.studio',
  whatsappNumber: '584127723148',
  whatsappDisplay: company.phoneDisplay,
  email: company.email,
  year: Number(company.foundingDate),
  ogImage: '/assets/og.webp',
  logo: '/assets/logo-square.png',
  // Fecha de referencia para datos estructurados. Ajusta si la empresa existe desde antes.
  foundingDate: company.foundingDate,
  contentUpdated: company.contentUpdated,
  address: {
    country: company.address.country,
    countryName: company.address.countryName,
    /* Rellenar solo con una ciudad/estado reales; si están vacíos no se publican. */
    locality: company.address.locality,
    region: company.address.region,
  },
  /* Cuenta de X/Twitter oficial (@usuario) cuando exista. */
  twitter: '',
  areaServed: company.areaServed.map((a) => a.name),
  currenciesAccepted: company.currenciesAccepted,
  paymentAccepted: company.paymentAccepted,
  /*
   * Enlaces oficiales de la empresa (Instagram, LinkedIn, Facebook, Google Business
   * Profile, Bing Places, GitHub...). Añadirlos aquí refuerza la entidad de marca
   * que Google y Bing usan para mostrar el panel "Acerca de".
   */
  sameAs: sameAsProfiles() as string[],
  /*
   * Códigos de verificación de los buscadores. Se pegan tal cual los entrega cada
   * consola y la etiqueta <meta> solo se renderiza cuando el valor no está vacío.
   */
  verification: {
    google: 'de7be1f2-4139-4e1c-8932-3fcb990ee688',
    bing: '1A53073E9F99FBDBD7E6229B2FCBB9B2',
    yandex: '',
    brave: '',
  },
};

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const content = {
  meta: {
    homeTitle: 'Windytech | Software a medida, WhatsApp y webs que venden',
    homeDescription:
      'Software a medida, automatización de WhatsApp, webs y SEO para empresas que quieren vender más. Un solo equipo, cotización clara y pagos con Binance o PayPal.',
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
    cta: 'Cotizar por WhatsApp',
    headerCta: 'Cuéntanos qué necesitas',
    menu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    about: 'Acerca de Windytech',
    aboutHref: '/nosotros/',
  },
  campaignBar: {
    label: 'CAMPAÑA ACTIVA',
    text: 'Tu landing page y tu bot de WhatsApp, listos para vender',
    link: 'Ver campañas',
  },
  whatsapp: {
    general: 'Hola Windytech, quiero cotizar mi proyecto.',
    floatLabel: 'Escríbenos por WhatsApp',
    campaign: 'Hola Windytech, vengo de la campaña ',
  },
  hero: {
    badge: 'Windytech · Desarrollo & Automatización',
    titleBefore: 'Software a medida,',
    titleHighlight: 'WhatsApp y webs que venden',
    description:
      'Convertimos tu idea en herramientas que trabajan por ti. Automatizamos tu WhatsApp, creamos webs que convierten y desarrollamos software a tu medida. Un solo equipo. Un solo proveedor.',
    bullets: [
      'Software hecho a tu medida',
      'WhatsApp que responde por ti',
      'Webs que convierten visitas en clientes',
    ],
    primaryCta: 'Pedir cotización por WhatsApp',
    secondaryCta: 'Ver servicios',
    panelTitle: '¿Qué necesitas hoy?',
    panelSubtitle: 'Elige un servicio. Te respondemos por WhatsApp.',
    quickLinks: [
      {
        label: 'Software a medida',
        icon: 'code',
        href: '/servicios/desarrollo-de-software/',
        message: 'Hola Windytech, quiero software a medida para mi negocio.',
      },
      {
        label: 'Automatización de WhatsApp',
        icon: 'chat',
        href: '/servicios/automatizacion-whatsapp/',
        message: 'Hola Windytech, quiero automatizar mi WhatsApp.',
      },
      {
        label: 'Páginas web y landing',
        icon: 'layout',
        href: '/servicios/paginas-web/',
        message: 'Hola Windytech, quiero una web que convierta visitas en clientes.',
      },
      {
        label: 'SEO y marketing',
        icon: 'chart',
        href: '/servicios/marketing-seo/',
        message: 'Hola Windytech, quiero aparecer en Google y atraer clientes.',
      },
      {
        label: 'Equipos y redes',
        icon: 'monitor',
        href: '/servicios/equipos-informaticos/',
        message: 'Hola Windytech, quiero cotizar equipos informáticos.',
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
    title: 'Elige por dónde quieres crecer',
    subtitle:
      'Cada campaña abre un chat de WhatsApp y te cuenta la promoción vigente.',
    cards: [
      {
        slug: 'software-a-medida',
        service: 'Desarrollo de software',
        tag: 'Software a medida',
        icon: 'code',
        title: 'Un sistema que trabaja como tu negocio',
        text: 'Creamos paneles e integraciones que ordenan tu operación y te devuelven horas cada semana.',
        cta: 'Quiero mi sistema',
        message: 'Hola Windytech, vengo de la campaña Software a medida',
      },
      {
        slug: 'whatsapp-24-7',
        service: 'Automatización de WhatsApp',
        tag: 'WhatsApp 24/7',
        icon: 'bot',
        title: 'Atiende a tus clientes sin parar',
        text: 'Responde, toma pedidos y agenda citas las 24 horas. Tus clientes escriben; tu bot contesta.',
        cta: 'Quiero mi asistente',
        message: 'Hola Windytech, vengo de la campaña WhatsApp 24/7',
      },
      {
        slug: 'pagina-web',
        service: 'Landing page o sitio web',
        tag: 'Página web',
        icon: 'layout',
        title: 'Tu landing page lista para vender',
        text: 'Rápida, clara y lista para celular. Cada sección empuja al visitante a escribirte o comprarte.',
        cta: 'Quiero mi página',
        message: 'Hola Windytech, vengo de la campaña Página web',
      },
      {
        slug: 'marketing-seo',
        service: 'Marketing, SEO y publicidad',
        tag: 'Marketing y SEO',
        icon: 'chart',
        title: 'Atrae clientes nuevos cada semana',
        text: 'Posicionamiento local, contenido y campañas con métricas reales. Sin promesas vacías.',
        cta: 'Quiero más clientes',
        message: 'Hola Windytech, vengo de la campaña Marketing y SEO',
      },
    ],
  },
  services: {
    title: 'Todo lo que tu negocio necesita, en un solo lugar',
    subtitle: 'Un solo equipo para vender más y trabajar mejor.',
    cta: 'Cotizar este servicio',
    cards: [
      {
        icon: 'code',
        title: 'Desarrollo de software a medida',
        text: '¿Planillas y procesos manuales? Construimos herramientas que ordenan tu operación y te devuelven horas cada semana.',
        message: 'Hola Windytech, quiero cotizar desarrollo de software a medida.',
      },
      {
        icon: 'chat',
        title: 'Automatización de WhatsApp',
        text: 'Responde preguntas, toma pedidos y agenda citas las 24 horas. Sin que tu equipo esté pegado al teléfono.',
        message: 'Hola Windytech, quiero cotizar automatización de WhatsApp.',
      },
      {
        icon: 'layout',
        title: 'Landing pages y sitios web',
        text: 'Rápidas, claras y listas para celular. Cada sección empuja al visitante a escribirte o comprarte.',
        message: 'Hola Windytech, quiero cotizar una landing page o sitio web.',
      },
      {
        icon: 'chart',
        title: 'Marketing, SEO y publicidad',
        text: 'Aparece cuando tus clientes te buscan. Posicionamiento local, contenido y campañas con métricas reales.',
        message: 'Hola Windytech, quiero cotizar marketing, SEO y publicidad.',
      },
      {
        icon: 'network',
        title: 'Redes e infraestructura',
        text: 'Configuramos tu red e infraestructura. Disponible solo en Venezuela.',
        message: 'Hola Windytech, quiero cotizar configuración de redes e infraestructura.',
      },
      {
        icon: 'monitor',
        title: 'Equipos informáticos',
        text: 'Laptops, monitores y equipos para tu oficina. Te asesoramos para elegir lo que de verdad necesitas.',
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
    title: 'Trabajamos contigo, estés donde estés',
    text: 'Desde tu primer cliente hasta varias sedes. Ajustamos el servicio a tu etapa y a tu presupuesto.',
    bullets: [
      {
        title: 'Precios claros',
        text: 'Sabes cuánto cuesta antes de empezar.',
      },
      {
        title: 'Atención directa',
        text: 'Hablas con quien hace el trabajo.',
      },
      {
        title: 'Todo en un solo lugar',
        text: 'Web, WhatsApp, marketing y equipos. Un solo proveedor.',
      },
    ],
    segments: [
      {
        label: 'PEQUEÑAS EMPRESAS',
        text: 'Una web profesional, un bot de WhatsApp y publicidad para conseguir tus primeros clientes en línea.',
      },
      {
        label: 'MEDIANAS EMPRESAS',
        text: 'Automatizamos ventas y atención, sumamos SEO y software para ordenar tu operación mientras creces.',
      },
      {
        label: 'GRANDES EMPRESAS',
        text: 'Equipo de marketing dedicado, campañas a gran escala, equipamiento y automatizaciones a medida.',
      },
    ],
  },
  equipment: {
    eyebrow: 'EQUIPOS INFORMÁTICOS',
    title: 'Equipos listos para tu puesto de trabajo',
    text: 'Laptops, monitores y accesorios con precio en dólares. Pides tu cotización y te confirmamos stock y entrega.',
    bullets: [
      'Laptops y computadoras de escritorio',
      'Monitores, impresoras y accesorios',
      'Redes y conectividad para tu local',
      'Asesoría para importar o exportar equipos',
    ],
    cta: 'Ver el catálogo',
    message: 'Hola Windytech, quiero cotizar un equipo informático.',
    note: 'Al cotizar confirmamos disponibilidad, precio y tiempo de entrega.',
  },
  payments: {
    eyebrow: 'PAGOS INTERNACIONALES',
    title: 'Pagas como ya pagas',
    text: 'Paga desde cualquier país con Binance o PayPal. Seguro y sin rodeos.',
    methods: ['Binance', 'PayPal'],
    methodDetails: {
      Binance: 'USDT · Sin comisiones',
      PayPal: 'Saldo o tarjeta',
    },
    /* Nombre que se muestra en la tarjeta (el método sigue siendo Binance). */
    methodLabels: {
      Binance: 'Binance Pay',
      PayPal: 'PayPal',
    },
    stepsTitle: 'Tres pasos y listo',
    steps: [
      'Pides tu cotización en el catálogo.',
      'Confirmamos stock y tiempo de entrega.',
      'Recibes los datos oficiales para transferir.',
    ],
    secureNote: 'Verificamos cada transacción con nuestro equipo',
    note: 'Aceptas la cotización y te enviamos los datos para pagar.',
  },
  visibility: {
    eyebrow: 'VISIBILIDAD EN GOOGLE',
    title: 'Así te ven tus clientes cuando te buscan',
    text:
      'Posicionamos tu negocio en Google con SEO local, páginas optimizadas y contenido que responde lo que tu cliente escribe. Así se ve un resultado real.',
    bullets: [
      {
        title: 'Posicionamiento local',
        text: 'Apareces en las búsquedas de tu ciudad y tu barrio.',
      },
      {
        title: 'Página optimizada',
        text: 'Títulos, descripciones y palabras clave en cada servicio.',
      },
      {
        title: 'Medición real',
        text: 'Vemos cuántas visitas trae Google y cuáles piden cotización.',
      },
    ],
    cta: 'Mejorar mi posición en Google',
    message: 'Hola Windytech, quiero mejorar la posición de mi negocio en Google.',
    previewTitle: 'Windytech | Software a medida, WhatsApp y webs que venden',
    previewUrl: 'https://windytech.studio',
    previewDescription:
      'Software a medida, automatización de WhatsApp, webs y SEO para empresas que quieren vender más. Un solo equipo, cotización clara y pagos con Binance o PayPal.',
  },
  cta: {
    title: 'Hablemos de tu proyecto',
    text: 'Cuéntanos qué necesitas resolver. Te respondemos por WhatsApp con alcance y precio.',
    button: 'Inicia tu proyecto por WhatsApp',
  },
  faqs: {
    eyebrow: 'PREGUNTAS FRECUENTES',
    title: 'Preguntas que nos hacen siempre',
    subtitle: 'Qué hacemos, cómo trabajamos y cómo cotizar. En corto.',
    items: [
      {
        question: '¿Qué es Windytech y a qué se dedica?',
        answer:
          'Somos un estudio de software, automatización de WhatsApp, diseño web y marketing con base en Venezuela. Ayudamos a empresas de cualquier país a vender más y trabajar mejor.',
      },
      {
        question: '¿Dónde está ubicada Windytech?',
        answer:
          'Estamos en Venezuela y atendemos proyectos digitales de forma remota en cualquier país. Redes, infraestructura y entrega de equipos, solo en Venezuela.',
      },
      {
        question: '¿Qué servicios digitales ofrece Windytech?',
        answer:
          'Desarrollamos software y aplicaciones web, automatizamos WhatsApp Business, diseñamos webs y landing pages, y ofrecemos SEO, publicidad, redes e infraestructura.',
      },
      {
        question: '¿Cuánto cuesta una página web o un software a medida?',
        answer:
          'Depende del alcance, las funciones y las integraciones. Cuéntanos tu objetivo y te enviamos la cotización antes de empezar.',
      },
      {
        question: '¿Pueden automatizar WhatsApp Business para pedidos o citas?',
        answer:
          'Sí. Automatizamos respuestas y flujos para consultas, pedidos y citas. Revisamos tu proceso y definimos el alcance contigo antes de cotizar.',
      },
      {
        question: '¿Ofrecen posicionamiento SEO y marketing digital?',
        answer:
          'Sí. Trabajamos SEO, contenido y campañas según tus objetivos. No prometemos posiciones: medimos visitas, consultas y cotizaciones reales.',
      },
      {
        question: '¿Trabajan con empresas fuera de Venezuela?',
        answer:
          'Sí. Atendemos proyectos digitales de forma remota en cualquier país. Redes e infraestructura, solo en Venezuela.',
      },
      {
        question: '¿Cómo solicito una cotización?',
        answer:
          'Escríbenos por WhatsApp o usa el formulario. Indica el servicio, qué necesitas resolver y cómo contactarte. Te respondemos con alcance y precio.',
      },
    ],
  },
  contact: {
    eyebrow: 'CONTACTO',
    title: 'Hablemos de tu proyecto',
    text: 'Cuéntanos qué necesitas. Te respondemos por WhatsApp con alcance y precio.',
    cards: [
      { label: 'WHATSAPP', value: site.whatsappDisplay, href: `https://wa.me/${site.whatsappNumber}`, icon: 'whatsapp' },
      { label: 'CORREO', value: site.email, href: `mailto:${site.email}`, icon: 'mail' },
      { label: 'SITIO WEB', value: site.domain, href: site.url, icon: 'globe' },
      {
        label: 'COBERTURA',
        value: 'Digital para cualquier país. Redes e infraestructura, solo en Venezuela.',
        icon: 'globe',
      },
    ],
    form: {
      name: 'Nombre',
      namePlaceholder: 'Tu nombre',
      business: 'Negocio',
      businessPlaceholder: 'Nombre de tu negocio (opcional)',
      service: 'Servicio de interés',
      phone: 'Teléfono o WhatsApp',
      phonePlaceholder: '+58 412 1234567 (opcional)',
      email: 'Correo electrónico',
      emailPlaceholder: 'tu@correo.com (opcional)',
      message: 'Mensaje',
      messagePlaceholder: 'Cuéntanos qué necesitas',
      submit: 'Enviar consulta',
      sending: 'Enviando tu consulta…',
      note: 'Guardamos tu consulta y te respondemos con el alcance y el precio.',
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

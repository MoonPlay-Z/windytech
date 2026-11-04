export type Lang = 'es' | 'en';

export const site = {
  name: 'Windy Tech',
  url: 'https://windytech.studio',
  domain: 'www.windytech.studio',
  whatsappNumber: '584127723148',
  whatsappDisplay: '+58 412-7723148',
  email: 'windytechestudio@gmail.com',
  year: 2026,
  ogImage: '/assets/og.png',
};

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const content = {
  es: {
    meta: {
      homeTitle: 'Windy Tech | Desarrollo de software, automatización y marketing',
      homeDescription:
        'Desarrollamos software a medida, automatizamos tu WhatsApp y creamos webs que venden. Marketing, SEO y equipos informáticos para empresas en Venezuela y el mundo.',
      homeOgAlt: 'Windy Tech — Desarrollo de software, automatización y marketing',
    },
    nav: {
      home: 'Inicio',
      items: [
        { label: 'Inicio', href: '#inicio' },
        { label: 'Servicios', href: '#servicios' },
        { label: 'Campañas', href: '#campanas' },
        { label: 'Equipos', href: '#equipos' },
        { label: 'Pagos', href: '#pagos' },
        { label: 'Contacto', href: '#contacto' },
      ],
      cta: 'Solicita tu cotización',
      menu: 'Abrir menú',
      closeMenu: 'Cerrar menú',
      switchLang: 'Ver sitio en inglés',
      switchLangShort: 'EN',
    },
    campaignBar: {
      label: 'CAMPAÑA ACTIVA',
      text: 'Landing page + bot de WhatsApp para tu negocio',
      link: 'Ver campañas',
    },
    whatsapp: {
      general: 'Hola Windy Tech, quiero una cotización.',
      floatLabel: 'Escríbenos por WhatsApp',
      campaign: 'Hola Windy Tech, vengo de la campaña ',
    },
    hero: {
      badge: 'Windy Tech · Desarrollo & Automatización',
      titleBefore: 'Tu negocio,',
      titleHighlight: 'conectado y automatizado',
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
          message: 'Hola Windy Tech, quiero desarrollar software a medida para mi negocio.',
        },
        {
          label: 'Automatización de WhatsApp',
          icon: 'chat',
          message: 'Hola Windy Tech, quiero automatizar mi WhatsApp.',
        },
        {
          label: 'Landing page o sitio web',
          icon: 'layout',
          message: 'Hola Windy Tech, quiero una landing page o un sitio web.',
        },
        {
          label: 'Marketing, SEO y publicidad',
          icon: 'chart',
          message: 'Hola Windy Tech, quiero marketing, SEO y publicidad para mi negocio.',
        },
        {
          label: 'Equipos informáticos',
          icon: 'monitor',
          href: '#equipos',
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
          message: 'Hola Windy Tech, vengo de la campaña Software a medida',
        },
        {
          tag: 'WhatsApp 24/7',
          icon: 'bot',
          title: 'Atiende a tus clientes sin parar',
          text: 'Un asistente automático responde, toma pedidos y agenda citas mientras tú trabajas.',
          cta: 'Quiero mi asistente',
          message: 'Hola Windy Tech, vengo de la campaña WhatsApp 24/7',
        },
        {
          tag: 'Página web',
          icon: 'layout',
          title: 'Tu landing page lista para vender',
          text: 'Una página clara, rápida y con botón directo a tu WhatsApp para convertir visitas en clientes.',
          cta: 'Quiero mi página',
          message: 'Hola Windy Tech, vengo de la campaña Página web',
        },
        {
          tag: 'Marketing y SEO',
          icon: 'chart',
          title: 'Atrae clientes nuevos cada semana',
          text: 'Posicionamiento en Google y publicidad para que más personas encuentren tu negocio.',
          cta: 'Quiero más clientes',
          message: 'Hola Windy Tech, vengo de la campaña Marketing y SEO',
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
          message: 'Hola Windy Tech, quiero cotizar desarrollo de software a medida.',
        },
        {
          icon: 'chat',
          title: 'Automatización de WhatsApp',
          text: 'Chatbots y respuestas automáticas para atender clientes, tomar pedidos y agendar citas sin que tu equipo esté pegado al teléfono.',
          message: 'Hola Windy Tech, quiero cotizar automatización de WhatsApp.',
        },
        {
          icon: 'layout',
          title: 'Landing pages y sitios web',
          text: 'Diseño y desarrollo de páginas rápidas, claras y listas para celular, pensadas para que el visitante te escriba o te compre.',
          message: 'Hola Windy Tech, quiero cotizar una landing page o sitio web.',
        },
        {
          icon: 'chart',
          title: 'Marketing, SEO y publicidad',
          text: 'Posicionamiento en Google y campañas publicitarias para atraer clientes nuevos y medir resultados.',
          message: 'Hola Windy Tech, quiero cotizar marketing, SEO y publicidad.',
        },
        {
          icon: 'network',
          title: 'Redes e infraestructura',
          text: 'Configuramos tus equipos en red y la infraestructura de tu local u oficina. Disponible solo en Venezuela.',
          message: 'Hola Windy Tech, quiero cotizar configuración de redes e infraestructura.',
        },
        {
          icon: 'monitor',
          title: 'Equipos informáticos',
          text: 'Venta de computadoras y equipos para oficinas, tiendas y empresas, con asesoría para elegir lo que de verdad necesitas.',
          message: 'Hola Windy Tech, quiero cotizar equipos informáticos.',
        },
      ],
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
      message: 'Hola Windy Tech, quiero cotizar un equipo informático.',
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
      button: 'Solicita tu cotización',
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
  },
  en: {
    meta: {
      homeTitle: 'Windy Tech | Software development, automation and marketing',
      homeDescription:
        'Custom software, WhatsApp automation and high-converting websites. Marketing, SEO and IT equipment for businesses in Venezuela and worldwide.',
      homeOgAlt: 'Windy Tech — Software development, automation and marketing',
    },
    nav: {
      home: 'Home',
      items: [
        { label: 'Home', href: '#inicio' },
        { label: 'Services', href: '#servicios' },
        { label: 'Campaigns', href: '#campanas' },
        { label: 'Equipment', href: '#equipos' },
        { label: 'Payments', href: '#pagos' },
        { label: 'Contact', href: '#contacto' },
      ],
      cta: 'Request a quote',
      menu: 'Open menu',
      closeMenu: 'Close menu',
      switchLang: 'Ver sitio en español',
      switchLangShort: 'ES',
    },
    campaignBar: {
      label: 'ACTIVE CAMPAIGN',
      text: 'Landing page + WhatsApp bot for your business',
      link: 'See campaigns',
    },
    whatsapp: {
      general: 'Hello Windy Tech, I would like a quote.',
      floatLabel: 'Message us on WhatsApp',
      campaign: 'Hello Windy Tech, I am coming from the campaign ',
    },
    hero: {
      badge: 'Windy Tech · Development & Automation',
      titleBefore: 'Your business,',
      titleHighlight: 'connected and automated',
      description:
        'We build custom software, automate your WhatsApp and create websites that convert visits into customers. Marketing, SEO and IT equipment for businesses ready to grow.',
      bullets: [
        'Custom software and automations for your operation',
        'Websites and landing pages that turn visits into customers',
        'International payments with Binance and PayPal',
      ],
      primaryCta: 'Talk on WhatsApp',
      secondaryCta: 'See services',
      panelTitle: 'What do you need today?',
      panelSubtitle: "Choose a service and we'll reply on WhatsApp.",
      quickLinks: [
        {
          label: 'Custom software',
          icon: 'code',
          message: 'Hello Windy Tech, I want to build custom software for my business.',
        },
        {
          label: 'WhatsApp automation',
          icon: 'chat',
          message: 'Hello Windy Tech, I want to automate my WhatsApp.',
        },
        {
          label: 'Landing page or website',
          icon: 'layout',
          message: 'Hello Windy Tech, I want a landing page or a website.',
        },
        {
          label: 'Marketing, SEO and ads',
          icon: 'chart',
          message: 'Hello Windy Tech, I want marketing, SEO and advertising for my business.',
        },
        {
          label: 'IT equipment',
          icon: 'monitor',
          href: '#equipos',
        },
      ],
      panelFooter: [
        { label: 'WhatsApp', icon: 'whatsapp' },
        { label: 'Web & SEO', icon: 'globe' },
        { label: 'Equipment', icon: 'monitor' },
      ],
    },
    campaigns: {
      eyebrow: 'WINDY TECH CAMPAIGNS',
      title: 'Choose the campaign your business needs',
      subtitle:
        "Each campaign opens a WhatsApp chat with its name. When you reply, we'll share the current promotion.",
      cards: [
        {
          tag: 'Custom software',
          icon: 'code',
          title: 'A system that works like your business',
          text: 'We design and build tools, dashboards and integrations to organize your operation.',
          cta: 'I want my system',
          message: 'Hello Windy Tech, I am coming from the Custom software campaign',
        },
        {
          tag: 'WhatsApp 24/7',
          icon: 'bot',
          title: 'Serve your customers non-stop',
          text: 'An automated assistant replies, takes orders and books appointments while you work.',
          cta: 'I want my assistant',
          message: 'Hello Windy Tech, I am coming from the WhatsApp 24/7 campaign',
        },
        {
          tag: 'Website',
          icon: 'layout',
          title: 'Your landing page ready to sell',
          text: 'A clear, fast page with a direct WhatsApp button to turn visits into customers.',
          cta: 'I want my page',
          message: 'Hello Windy Tech, I am coming from the Website campaign',
        },
        {
          tag: 'Marketing & SEO',
          icon: 'chart',
          title: 'Attract new customers every week',
          text: 'Google ranking and advertising so more people find your business.',
          cta: 'I want more customers',
          message: 'Hello Windy Tech, I am coming from the Marketing & SEO campaign',
        },
      ],
    },
    services: {
      title: 'Our services',
      subtitle: 'Everything your business needs to sell more and work better, from one team.',
      cta: 'Quote this service',
      cards: [
        {
          icon: 'code',
          title: 'Custom software development',
          text: 'Web applications, dashboards, integrations and internal tools designed around the way you work.',
          message: 'Hello Windy Tech, I would like a quote for custom software development.',
        },
        {
          icon: 'chat',
          title: 'WhatsApp automation',
          text: 'Chatbots and automated replies to serve customers, take orders and book appointments without keeping your team on the phone.',
          message: 'Hello Windy Tech, I would like a quote for WhatsApp automation.',
        },
        {
          icon: 'layout',
          title: 'Landing pages and websites',
          text: 'Fast, clear, mobile-ready pages designed to make visitors message you or buy from you.',
          message: 'Hello Windy Tech, I would like a quote for a landing page or website.',
        },
        {
          icon: 'chart',
          title: 'Marketing, SEO and advertising',
          text: 'Google ranking and ad campaigns to attract new customers and measure results.',
          message: 'Hello Windy Tech, I would like a quote for marketing, SEO and advertising.',
        },
        {
          icon: 'network',
          title: 'Networks and infrastructure',
          text: 'We set up your office or store network and IT infrastructure. Available in Venezuela only.',
          message: 'Hello Windy Tech, I would like a quote for network and infrastructure setup.',
        },
        {
          icon: 'monitor',
          title: 'IT equipment',
          text: 'Computers and equipment for offices, stores and companies, with advice on what you really need.',
          message: 'Hello Windy Tech, I would like a quote for IT equipment.',
        },
      ],
    },
    clients: {
      title: 'We work with businesses of all sizes',
      text: 'From a startup getting off the ground to a company with multiple locations. We adapt the service to your stage and budget.',
      bullets: [
        { title: 'Clear pricing', text: 'We tell you the cost before we start.' },
        { title: 'Direct support', text: 'You talk to the team doing the work.' },
        { title: 'Everything in one place', text: 'Web, WhatsApp, marketing and equipment from one provider.' },
      ],
      segments: [
        {
          label: 'SMALL BUSINESSES',
          text: 'A professional website, a WhatsApp bot and advertising to get your first online customers.',
        },
        {
          label: 'MID-SIZED BUSINESSES',
          text: 'Sales and support automation, ongoing SEO and software to organize your operation as you grow.',
        },
        {
          label: 'LARGE COMPANIES',
          text: 'A dedicated marketing team, large-scale campaigns, IT equipment and custom automations.',
        },
      ],
    },
    equipment: {
      eyebrow: 'IT EQUIPMENT',
      title: 'Catalog coming soon',
      text: "We're preparing the catalog with pricing and availability. In the meantime, tell us what you need and we'll quote it.",
      bullets: [
        'Laptops and desktop computers',
        'Monitors, printers and accessories',
        'Networking and connectivity for your office',
        'Guidance to import or export equipment',
      ],
      cta: 'Quote equipment on WhatsApp',
      message: 'Hello Windy Tech, I would like a quote for IT equipment.',
      note: "We'll confirm availability, price and delivery time when we quote.",
    },
    payments: {
      title: 'Payment methods',
      text: 'Pay securely from anywhere with the platforms you already use.',
      methods: ['Binance', 'PayPal'],
      note: "When you accept your quote, we'll send you the payment details.",
    },
    cta: {
      title: 'Ready to automate your business?',
      text: 'Write to us and get a quote on WhatsApp. We accept Binance and PayPal.',
      button: 'Request a quote',
    },
    contact: {
      eyebrow: 'CONTACT',
      title: "Let's talk about your project",
      text: "Tell us what you need and we'll send you a quote on WhatsApp.",
      cards: [
        { label: 'WHATSAPP', value: site.whatsappDisplay, href: `https://wa.me/${site.whatsappNumber}`, icon: 'whatsapp' },
        { label: 'EMAIL', value: site.email, href: `mailto:${site.email}`, icon: 'mail' },
        { label: 'WEBSITE', value: site.domain, href: site.url, icon: 'globe' },
        {
          label: 'COVERAGE',
          value: 'Digital services worldwide. Network and infrastructure services in Venezuela only.',
          icon: 'globe',
        },
      ],
      form: {
        name: 'Name',
        namePlaceholder: 'Your name',
        business: 'Business',
        businessPlaceholder: 'Your business name (optional)',
        service: 'Service of interest',
        message: 'Message',
        messagePlaceholder: 'Tell us what you need',
        submit: 'Send on WhatsApp',
        note: 'When you submit, WhatsApp will open with your message ready to send.',
        emailFallback: 'Prefer email? Write to',
        options: [
          'Custom software',
          'WhatsApp automation',
          'Landing page or website',
          'Marketing, SEO and advertising',
          'Networks and infrastructure',
          'IT equipment',
          'Other',
        ],
      },
    },
    footer: {
      tagline: 'DEVELOPMENT & AUTOMATION',
      rights: 'All rights reserved.',
      privacy: 'Privacy',
      terms: 'Terms',
      legalPaths: {
        privacy: '/en/legal/privacy',
        terms: '/en/legal/terms',
      },
    },
  },
} as const;

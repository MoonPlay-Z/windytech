import type { Lang } from './site';
import { site } from './site';

type Fact = { label: string; value: string };
type Step = { title: string; text: string };

type AboutContent = {
  eyebrow: string;
  homeTitle: string;
  homeText: string;
  homeCta: string;
  homeFacts: Fact[];
  pageTitle: string;
  pageDescription: string;
  pageH1: string;
  intro: string;
  definitionTitle: string;
  definition: string[];
  servicesTitle: string;
  services: string[];
  processTitle: string;
  process: Step[];
  coverageTitle: string;
  coverage: string[];
  factsTitle: string;
  facts: Fact[];
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  backHome: string;
};

const sharedContact = `WhatsApp ${site.whatsappDisplay} · ${site.email}`;

export const aboutContent: Record<Lang, AboutContent> = {
  es: {
    eyebrow: 'ACERCA DE WINDY TECH',
    homeTitle: 'Un estudio que construye, automatiza y posiciona',
    homeText:
      'Windytech es un estudio digital que ayuda a negocios a vender más y trabajar mejor. Diseñamos software a medida, automatizamos WhatsApp, creamos páginas web y acompañamos con marketing, SEO y equipos informáticos.',
    homeCta: 'Conoce más sobre Windytech',
    homeFacts: [
      {
        label: 'Qué hacemos',
        value: 'Software, automatización de WhatsApp, webs, SEO y equipos.',
      },
      {
        label: 'Dónde trabajamos',
        value: 'Servicios digitales en todo el mundo; redes y equipos en Venezuela.',
      },
      {
        label: 'Idiomas',
        value: 'Atendemos en español e inglés.',
      },
      {
        label: 'Cómo trabajamos',
        value: 'Alcance, precio y fechas por escrito antes de empezar.',
      },
    ],
    pageTitle: 'Acerca de Windytech | Software, automatización y marketing',
    pageDescription:
      'Windytech es un estudio de desarrollo de software, automatización de WhatsApp, páginas web y marketing digital. Conoce qué hacemos, cómo trabajamos, dónde prestamos servicio y cómo contactarnos.',
    pageH1: 'Acerca de Windytech',
    intro:
      'Windytech es un estudio digital que diseña, construye y posiciona soluciones para negocios: software a medida, automatización de WhatsApp, páginas web, marketing y equipos informáticos.',
    definitionTitle: '¿Qué es Windytech?',
    definition: [
      'Windytech es una empresa de servicios digitales con base en Venezuela que trabaja con clientes de cualquier país de forma remota. Su equipo desarrolla aplicaciones y herramientas a la medida, automatiza la atención por WhatsApp Business, crea sitios web y landing pages, y complementa el trabajo con SEO, publicidad y equipamiento informático.',
      'Trabaja con emprendimientos, pequeñas empresas, negocios en crecimiento y compañías con varias sedes. Cada proyecto se cotiza con alcance cerrado, precio claro y fechas definidas, y se atiende directamente con las personas que ejecutan el trabajo.',
    ],
    servicesTitle: 'Qué hace Windytech',
    services: [
      'Desarrollo de software a medida: paneles, aplicaciones web, integraciones y herramientas internas.',
      'Automatización de WhatsApp Business: respuestas, pedidos, citas y seguimiento.',
      'Landing pages y sitios web rápidos, claros y pensados para convertir visitas en clientes.',
      'Marketing, SEO y publicidad para atraer clientes y medir resultados.',
      'Redes e infraestructura para oficinas y locales, disponible en Venezuela.',
      'Venta y asesoría de equipos informáticos para empresas y emprendimientos.',
    ],
    processTitle: 'Cómo trabaja Windytech',
    process: [
      {
        title: 'Diagnóstico',
        text: 'Entendemos el negocio, el problema y el resultado esperado.',
      },
      {
        title: 'Propuesta',
        text: 'Entregamos alcance, precio, entregables y fechas por escrito.',
      },
      {
        title: 'Anticipo',
        text: 'El proyecto inicia con el 50% del pago y los materiales del cliente.',
      },
      {
        title: 'Ejecución',
        text: 'Trabajamos por hitos con comunicación directa y revisiones acordadas.',
      },
      {
        title: 'Entrega',
        text: 'Probamos, documentamos y acompañamos la puesta en marcha.',
      },
      {
        title: 'Seguimiento',
        text: 'Corregimos errores incluidos y ofrecemos soporte o mejora continua.',
      },
    ],
    coverageTitle: 'Cobertura e idiomas',
    coverage: [
      'Los servicios digitales —software, web, automatización, marketing y SEO— se prestan de forma remota para clientes de cualquier país.',
      'La instalación de redes, la infraestructura y la entrega física de equipos se coordinan únicamente en Venezuela.',
      'La atención y la documentación de los proyectos están disponibles en español e inglés.',
    ],
    factsTitle: 'Datos de la empresa',
    facts: [
      { label: 'Nombre', value: 'Windytech' },
      {
        label: 'Actividad',
        value: 'Desarrollo de software, automatización, diseño web, marketing digital y equipos informáticos.',
      },
      { label: 'Fundación', value: site.foundingDate },
      {
        label: 'Cobertura',
        value: 'Servicios digitales en todo el mundo. Redes, infraestructura y equipos en Venezuela.',
      },
      { label: 'Idiomas', value: 'Español e inglés' },
      { label: 'Medios de pago', value: 'Binance y PayPal' },
      { label: 'Contacto', value: sharedContact },
      { label: 'Sitio web', value: site.domain },
    ],
    ctaTitle: '¿Quieres trabajar con Windytech?',
    ctaText: 'Cuéntanos qué necesitas y te enviamos una cotización por WhatsApp.',
    ctaButton: 'Hablar con Windytech',
    backHome: 'Volver al inicio',
  },
  en: {
    eyebrow: 'ABOUT WINDY TECH',
    homeTitle: 'A studio that builds, automates and positions',
    homeText:
      'Windytech is a digital studio that helps businesses sell more and work better. We build custom software, automate WhatsApp, create websites and support your growth with marketing, SEO and IT equipment.',
    homeCta: 'Learn more about Windytech',
    homeFacts: [
      {
        label: 'What we do',
        value: 'Software, WhatsApp automation, websites, SEO and IT equipment.',
      },
      {
        label: 'Where we work',
        value: 'Digital services worldwide; networks and equipment in Venezuela.',
      },
      {
        label: 'Languages',
        value: 'We work in Spanish and English.',
      },
      {
        label: 'How we work',
        value: 'Scope, price and timeline agreed in writing before we start.',
      },
    ],
    pageTitle: 'About Windytech | Software, automation and marketing',
    pageDescription:
      'Windytech is a software development, WhatsApp automation, web design and digital marketing studio. Learn what we do, how we work, where we operate and how to contact us.',
    pageH1: 'About Windytech',
    intro:
      'Windytech is a digital studio that designs, builds and positions solutions for businesses: custom software, WhatsApp automation, websites, marketing and IT equipment.',
    definitionTitle: 'What is Windytech?',
    definition: [
      'Windytech is a digital services company based in Venezuela that works remotely with clients in any country. Its team builds custom applications and internal tools, automates WhatsApp Business support, creates websites and landing pages, and supports the work with SEO, advertising and IT equipment.',
      'It works with startups, small businesses, growing companies and organizations with multiple locations. Every project is quoted with a fixed scope, clear pricing and defined dates, and clients speak directly with the people doing the work.',
    ],
    servicesTitle: 'What Windytech does',
    services: [
      'Custom software: dashboards, web applications, integrations and internal tools.',
      'WhatsApp Business automation: replies, orders, appointments and follow-up.',
      'Fast, clear landing pages and websites designed to turn visits into customers.',
      'Marketing, SEO and advertising to attract customers and measure results.',
      'Networks and infrastructure for offices and stores, available in Venezuela.',
      'IT equipment sales and advice for businesses and startups.',
    ],
    processTitle: 'How Windytech works',
    process: [
      {
        title: 'Discovery',
        text: 'We understand the business, the problem and the expected result.',
      },
      {
        title: 'Proposal',
        text: 'We deliver scope, price, deliverables and dates in writing.',
      },
      {
        title: 'Deposit',
        text: 'Work starts with a 50% deposit and the client materials.',
      },
      {
        title: 'Execution',
        text: 'We work in milestones with direct communication and agreed revisions.',
      },
      {
        title: 'Delivery',
        text: 'We test, document and support the launch.',
      },
      {
        title: 'Follow-up',
        text: 'We fix included issues and offer ongoing support or improvements.',
      },
    ],
    coverageTitle: 'Coverage and languages',
    coverage: [
      'Digital services —software, web, automation, marketing and SEO— are delivered remotely to clients in any country.',
      'Network setup, infrastructure and physical equipment delivery are coordinated in Venezuela only.',
      'Support and project documentation are available in Spanish and English.',
    ],
    factsTitle: 'Company details',
    facts: [
      { label: 'Name', value: 'Windytech' },
      {
        label: 'Business',
        value: 'Software development, automation, web design, digital marketing and IT equipment.',
      },
      { label: 'Founded', value: site.foundingDate },
      {
        label: 'Coverage',
        value: 'Digital services worldwide. Networks, infrastructure and equipment in Venezuela.',
      },
      { label: 'Languages', value: 'Spanish and English' },
      { label: 'Payment methods', value: 'Binance and PayPal' },
      { label: 'Contact', value: sharedContact },
      { label: 'Website', value: site.domain },
    ],
    ctaTitle: 'Want to work with Windytech?',
    ctaText: 'Tell us what you need and we will send you a quote on WhatsApp.',
    ctaButton: 'Talk to Windytech',
    backHome: 'Back to home',
  },
};

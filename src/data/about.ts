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
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  objectivesTitle: string;
  objectives: string[];
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

export const aboutContent: AboutContent = {
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
    'Windytech es un estudio de software a medida, automatización de WhatsApp, páginas web y marketing digital. Conoce qué hacemos y cómo trabajamos.',
  pageH1: 'Acerca de Windytech',
  intro:
    'Windytech es un estudio digital que diseña, construye y posiciona soluciones para negocios: software a medida, automatización de WhatsApp, páginas web, marketing y equipos informáticos.',
  definitionTitle: '¿Qué es Windytech?',
  definition: [
    'Windytech es una empresa de servicios digitales con base en Venezuela que trabaja con clientes de cualquier país de forma remota. Su equipo desarrolla aplicaciones y herramientas a la medida, automatiza la atención por WhatsApp Business, crea sitios web y landing pages, y complementa el trabajo con SEO, publicidad y equipamiento informático.',
    'Trabaja con emprendimientos, pequeñas empresas, negocios en crecimiento y compañías con varias sedes. Cada proyecto se cotiza con alcance cerrado, precio claro y fechas definidas, y se atiende directamente con las personas que ejecutan el trabajo.',
  ],
  missionTitle: 'Nuestra misión',
  missionText:
    'Ayudar a negocios de cualquier tamaño a crecer con tecnología útil: software a la medida, automatización y presencia digital que ahorran tiempo, reducen errores y generan ventas.',
  visionTitle: 'Nuestra visión',
  visionText:
    'Ser el estudio de referencia en Latinoamérica para negocios que quieren digitalizarse sin complicaciones, con soluciones claras, medibles y sostenibles en el tiempo.',
  objectivesTitle: 'Nuestros objetivos',
  objectives: [
    'Entregar cada proyecto con alcance, precio y fechas claras, sin sorpresas.',
    'Automatizar los procesos repetitivos para que los equipos se enfoquen en vender y atender.',
    'Construir sitios y aplicaciones rápidas, accesibles y medibles.',
    'Acompañar a cada cliente con soporte y mejora continua después de la entrega.',
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
};

/**
 * Datos de la empresa para el panel de conocimiento de Google, Bing y Brave.
 *
 * Este archivo es la fuente única de verdad: el JSON-LD del sitio, la página
 * "Nosotros" y las páginas por ciudad leen de aquí. Cuando se rellene un
 * campo, el panel lateral del buscador empieza a reflejarlo.
 *
 * REGLA DE ORO: ningún dato inventado. Si un campo no se sabe, se deja vacío
 * y el schema simplemente no lo publica. Google penaliza las direcciones
 * virtuales o ficticias en el `PostalAddress`.
 */

export type SocialProfile = {
  /** Nombre de la red, tal como se muestra en el schema. */
  name: string;
  /** URL completo del perfil. Vacío = la red aún no existe. */
  url: string;
};

export type CompanyProfile = {
  /** Nombre comercial que aparece en el panel. */
  name: string;
  /** Nombre legal (Razón Social) si difiere del comercial. */
  legalName: string;
  /** Alias y grafías alternativas para que el buscador agrupe la entidad. */
  alternateNames: string[];
  /** Frase corta que Google muestra bajo el nombre en el panel. */
  slogan: string;
  /** Descripción larga: es el párrafo que sale en el panel lateral. */
  description: string;
  /** Año de fundación (solo el año, en formato de 4 dígitos). */
  foundingDate: string;
  /** Fecha de la última revisión del contenido del sitio. */
  contentUpdated: string;

  /** Dirección: solo datos reales y verificables. */
  address: {
    country: string;
    countryName: string;
    /** Ciudad. Vacío si no hay sede física. */
    locality: string;
    /** Estado o provincia. Vacío si no hay sede física. */
    region: string;
    /** Dirección en la calle. Vacío si se trabaja 100% remoto. */
    street: string;
    /** Código postal. Vacío si no aplica. */
    postalCode: string;
  };

  /** Teléfono principal en formato internacional, solo dígitos y '+'. */
  phone: string;
  /** Teléfono mostrado al cliente. */
  phoneDisplay: string;
  /** Teléfono secundario (fijo o línea alterna), opcional. */
  phoneSecondary: string;
  /** Correo de contacto. */
  email: string;

  /**
   * Horario de atención. Google lo muestra en el panel y lo usa para saber
   * si el negocio está abierto. Formato Schema.org.
   */
  openingHours: {
    days: string[];
    opens: string;
    closes: string;
    /** Fechas de cierre (festivos). */
    holidays?: string[];
  };

  /** Rango de precios con su justificación (lo muestra el panel). */
  priceRange: string;
  priceRangeReason: string;

  /** Categorías: la principal y las secundarias de Google Business Profile. */
  categories: { main: string; secondary: string[] };

  /** Idioma principal y adicionales. */
  languages: { primary: string; additional: string[] };

  /** Perfiles oficiales: el corazón del `sameAs`. */
  profiles: SocialProfile[];

  /**
   * Ficha de Google Business Profile.
   *
   * `profileUrl` es el enlace de la ficha en Google Maps y `reviewUrl` el
   * atajo para dejar reseña (el que genera Google con el botón "Opinar").
   * Con ambos vacíos, el botón de reseña se oculta en vez de llevar a un 404.
   */
  googleProfileUrl: string;
  reviewUrl: string;

  /** Enlace a la ficha de Bing Places (se sincroniza sola con Google). */
  bingPlacesUrl: string;

  /** Ciudad y zona horaria. */
  timeZone: string;

  /** Áreas donde se presta el servicio. */
  areaServed: { name: string; type: 'Country' | 'Place' | 'City' | 'State' }[];

  /** Métodos de pago. */
  paymentAccepted: string;
  currenciesAccepted: string;

  /** Frase que resume el trabajo en remoto. */
  remoteNote: string;
};

/**
 * Perfiles de redes sociales.
 *
 * IMPORTANTE: la URL debe ser la real y pública. Si la red todavía no existe,
 * deja el `url` vacío: es preferible publicar un solo perfil vrai que cinco
 * enlaces rotos o de terceros.
 */
const PROFILES: SocialProfile[] = [
  { name: 'Facebook', url: '' },
  { name: 'Instagram', url: '' },
  { name: 'LinkedIn', url: '' },
  { name: 'X', url: '' },
  { name: 'GitHub', url: '' },
  { name: 'YouTube', url: '' },
];

export const company: CompanyProfile = {
  name: 'Windytech',
  legalName: 'Windytech',
  alternateNames: ['Windy Tech', 'Windytech Studio', 'Windy Tech Studio'],
  slogan: 'Desarrollo de software, automatización de WhatsApp y marketing digital',
  description:
    'Windytech es un estudio digital-fondado en Venezuela que desarrolla software a la medida, automatiza la atención por WhatsApp Business, diseña páginas web y landing pages, y trabaja con SEO, publicidad y equipamiento informático. Los servicios digitales se prestan en remoto para clientes de cualquier país; la instalación de redes, la infraestructura y la entrega física de equipos se coordinan en Venezuela.',
  foundingDate: '2026',
  contentUpdated: '2026-11-09',

  address: {
    country: 'VE',
    countryName: 'Venezuela',
    // Trabaja 100% remoto: se deja vacío para no publicar una dirección falsa.
    locality: '',
    region: '',
    street: '',
    postalCode: '',
  },

  phone: '+584127723148',
  phoneDisplay: '+58 412-7723148',
  phoneSecondary: '',
  email: 'windytechestudio@gmail.com',

  openingHours: {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '18:00',
    holidays: [],
  },

  priceRange: '$$',
  priceRangeReason:
    'Los servicios digitales arrancan en 100 USD y los paquetes completos van de 100 a 1.200 USD, más el coste de los equipos informáticos.',

  categories: {
    main: 'Agencia de marketing digital',
    secondary: [
      'Desarrollo de software a medida',
      'Automatización de WhatsApp Business',
      'Diseño y desarrollo web',
      'Consultoría de SEO',
    ],
  },

  languages: {
    primary: 'es',
    additional: ['en'],
  },

  profiles: PROFILES,

  // Rellenar con los enlaces reales de la ficha de Google Business Profile.
  googleProfileUrl: '',
  reviewUrl: '',
  bingPlacesUrl: '',

  timeZone: 'America/Caracas',
  areaServed: [
    { name: 'Venezuela', type: 'Country' },
    { name: 'Caracas', type: 'City' },
    { name: 'Valencia', type: 'City' },
    { name: 'Maracay', type: 'City' },
    { name: 'Barquisimeto', type: 'City' },
    { name: 'Maracaibo', type: 'City' },
    { name: 'Puerto Cabello', type: 'City' },
    { name: 'Valle de Aragua', type: 'City' },
    { name: 'Mérida', type: 'City' },
    { name: 'Latinoamérica', type: 'Place' },
    { name: 'Worldwide', type: 'Place' },
  ],

  paymentAccepted: 'Binance, PayPal',
  currenciesAccepted: 'USD',
  remoteNote:
    'Atención 100% remota por WhatsApp y videollamada. Sin cita previa y sin costos de desplazamiento.',
};

/** Perfiles reales (con URL publicada) para el `sameAs` del schema. */
export function sameAsProfiles(): string[] {
  return company.profiles.map((p) => p.url.trim()).filter((url) => url.length > 0);
}

/** ¿Hay algún perfil social publicado? */
export function hasSocialProfiles(): boolean {
  return sameAsProfiles().length > 0;
}

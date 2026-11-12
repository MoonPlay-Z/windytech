/**
 * Ciudades donde trabajamos.
 *
 * Cada ciudad tiene contenido propio (cobertura, zonas, plazos y notas), para
 * que las páginas locales sean útiles de verdad y no contenido duplicado.
 */

export type City = {
  slug: string;
  name: string;
  state: string;
  /** Frase corta para el título y la descripción. */
  claim: string;
  /** Zonas o municipios donde llega el equipo. */
  zones: string[];
  /** Plazo típico de instalación o entrega. */
  delivery: string;
  /** Nota local:@un Solo si es distinto de la nota general. */
  note: string;
  /** Datos de contacto de la zona (opcional). */
  phone?: string;
};

export const CITIES: City[] = [
  {
    slug: 'caracas',
    name: 'Caracas',
    state: 'Distrito Capital',
    claim: 'Software, automatización y redes para negocios de la capital',
    zones: [
      'Chacao',
      'El Hatillo',
      'Las Mercedes',
      'Baruta',
      'Sucre',
      'Carlos María Bello',
    ],
    delivery: 'Instalación en 1 a 3 días dentro de la capital',
    note: 'Atención presencial en laboratorios de redes y equipos; el resto del trabajo se hace en remoto.',
  },
  {
    slug: 'valencia',
    name: 'Valencia',
    state: 'Carabobo',
    claim: 'Automatización y sistemas para empresas de Carabobo',
    zones: [
      'Valencia centro',
      'Naguanagua',
      'San Diego',
      'Los Guayos',
      'Guacara',
      'Bejuma',
    ],
    delivery: 'Instalación en 2 a 5 días en el área metropolitana',
    note: 'Proyecto local: redes, equipos y servidores en oficina, con soporte a distancia.',
  },
  {
    slug: 'maracay',
    name: 'Maracay',
    state: 'Aragua',
    claim: 'Tecnología y equipos para comercios de Aragua',
    zones: [
      'Maracay centro',
      'San Antonio',
      'Las Delicias',
      'Camatagua',
      'Villa de Cura',
      'Choroní',
    ],
    delivery: 'Instalación en 2 a 5 días en Maracay y San Antonio',
    note: 'Mantenimiento y soporte para empresas con sucursales en el centro y la zona industrial.',
  },
  {
    slug: 'barquisimeto',
    name: 'Barquisimeto',
    state: 'Lara',
    claim: 'Equipos, redes y páginas web para negocios de Lara',
    zones: [
      'Barquisimeto centro',
      'Cabudare',
      'El Tocuyo',
      'Jiménez',
      'Torres',
      'Santa Rosa',
    ],
    delivery: 'Entrega de 3 a 7 días según disponibilidad',
    note: 'Trabajamos con proveedores locales de hardware para reducir los tiempos de entrega.',
  },
  {
    slug: 'maracaibo',
    name: 'Maracaibo',
    state: 'Zulia',
    claim: 'Automatización y páginas web en el occidente',
    zones: [
      'Maracaibo centro',
      'La Guajira',
      'Santa Rita',
      'Machiques',
      'Los Puertos',
      'Catatumbo',
    ],
    delivery: 'Atención remota inmediata; instalación presencial en 3 a 6 días',
    note: 'El soporte remoto cubre toda la región; las visitas se coordinan con cita previa.',
  },
  {
    slug: 'puerto-cabello',
    name: 'Puerto Cabello',
    state: 'Carabobo',
    claim: 'Redes y equipos para la zona portuaria',
    zones: [
      'Puerto Cabello centro',
      'San Juan de los Morros',
      'Boca de Tocuyo',
      'Cagigal',
      'Píritu',
      'Los Places',
    ],
    delivery: 'Instalación en 3 a 6 días',
    note: 'Proyectos de red y virtualización con atención en horario de oficina.',
  },
  {
    slug: 'valle-de-aragua',
    name: 'Valle de Aragua',
    state: 'Aragua',
    claim: 'Soporte y mantenimiento en el centro del país',
    zones: [
      'La Victoria',
      'San Rafael',
      'San Casimiro',
      'Zamora',
      'Guaicaipuro',
      'El Limón',
    ],
    delivery: 'Atención remota el mismo día; visita en 2 a 4 días',
    note: 'Plan de mantenimiento mensual para empresas con varias sedes en el estado.',
  },
  {
    slug: 'merida',
    name: 'Mérida',
    state: 'Mérida',
    claim: 'Sistemas y equipos para negocios de los Andes',
    zones: [
      'Mérida centro',
      'El Chía',
      'Cácute',
      'Cardenal Quintero',
      'Rangel',
      'Tanakuy',
    ],
    delivery: 'Entrega en 4 a 8 días',
    note: 'Proyectos de software y automatización con alcance cerrado por etapas.',
  },
];

/**
 * Estados donde se presta el servicio, sin repetir.
 *
 * Cada estado agrupa las ciudades de su zona. Se usa en el pie de página y
 * en el schema para que los buscadores entiendan la cobertura real.
 */
export const STATES = Array.from(
  new Map(CITIES.map((city) => [city.state, { name: city.state, cities: [] as string[] }])).values(),
);

for (const city of CITIES) {
  const state = STATES.find((item) => item.name === city.state);
  if (state) state.cities.push(city.name);
}

export function cityBySlug(slug: string): City | undefined {
  return CITIES.find((city) => city.slug === slug);
}

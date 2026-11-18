/**
 * Ciudades donde trabajamos y referencia político-administrativa de Venezuela.
 *
 * Cada ciudad tiene contenido propio (cobertura, zonas, plazos y notas), para
 * que las páginas locales sean útiles de verdad y no contenido duplicado.
 *
 * Fuente de los estados: Anexo:Entidades federales de Venezuela (23 estados,
 * Distrito Capital y Dependencias Federales). Fuente de municipios: artículos
 * de cada estado. Ver `documentacion/ESTADOS-VENEZUELA.md`.
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
  /** Nota local. Solo si es distinto de la nota general. */
  note: string;
  /** Centro aproximado de la zona, para el área de servicio del schema. */
  latitude: number;
  longitude: number;
  /** Radio del área de servicio en metros (por defecto 50 km). */
  radiusKm?: number;
  /** Datos de contacto de la zona (opcional). */
  phone?: string;
};

export type StateEntity = {
  name: string;
  capital: string;
  type: 'state' | 'district' | 'federal';
};

/** Entidades federales de Venezuela, con su capital. */
export const VENEZUELA_STATES: StateEntity[] = [
  { name: 'Amazonas', capital: 'Puerto Ayacucho', type: 'state' },
  { name: 'Anzoátegui', capital: 'Barcelona', type: 'state' },
  { name: 'Apure', capital: 'San Fernando', type: 'state' },
  { name: 'Aragua', capital: 'Maracay', type: 'state' },
  { name: 'Barinas', capital: 'Barinas', type: 'state' },
  { name: 'Bolívar', capital: 'Ciudad Bolívar', type: 'state' },
  { name: 'Carabobo', capital: 'Valencia', type: 'state' },
  { name: 'Cojedes', capital: 'San Carlos', type: 'state' },
  { name: 'Delta Amacuro', capital: 'Tucupita', type: 'state' },
  { name: 'Falcón', capital: 'Coro', type: 'state' },
  { name: 'Guárico', capital: 'San Juan de los Morros', type: 'state' },
  { name: 'La Guaira', capital: 'La Guaira', type: 'state' },
  { name: 'Lara', capital: 'Barquisimeto', type: 'state' },
  { name: 'Mérida', capital: 'Mérida', type: 'state' },
  { name: 'Miranda', capital: 'Los Teques', type: 'state' },
  { name: 'Monagas', capital: 'Maturín', type: 'state' },
  { name: 'Nueva Esparta', capital: 'La Asunción', type: 'state' },
  { name: 'Portuguesa', capital: 'Guanare', type: 'state' },
  { name: 'Sucre', capital: 'Cumaná', type: 'state' },
  { name: 'Táchira', capital: 'San Cristóbal', type: 'state' },
  { name: 'Trujillo', capital: 'Trujillo', type: 'state' },
  { name: 'Yaracuy', capital: 'San Felipe', type: 'state' },
  { name: 'Zulia', capital: 'Maracaibo', type: 'state' },
  { name: 'Distrito Capital', capital: 'Caracas', type: 'district' },
  { name: 'Dependencias Federales', capital: 'Gran Roque', type: 'federal' },
];

/** Tipo de esquema correcto para una entidad (Distrito Capital no es un estado). */
export function stateEntityType(name: string): 'State' | 'AdministrativeArea' {
  const entity = VENEZUELA_STATES.find((item) => item.name === name);
  return entity?.type === 'state' ? 'State' : 'AdministrativeArea';
}

export const CITIES: City[] = [
  {
    slug: 'caracas',
    name: 'Caracas',
    state: 'Distrito Capital',
    claim: 'Software, automatización y redes para negocios de la capital',
    zones: ['Libertador', 'Chacao', 'El Hatillo', 'Baruta', 'Sucre', 'Las Mercedes'],
    delivery: 'Instalación en 1 a 3 días dentro del área metropolitana',
    note: 'Atención presencial en laboratorios de redes y equipos; el resto del trabajo se hace en remoto.',
    latitude: 10.4806,
    longitude: -66.9036,
    radiusKm: 40,
  },
  {
    slug: 'valencia',
    name: 'Valencia',
    state: 'Carabobo',
    claim: 'Automatización y sistemas para empresas de Carabobo',
    zones: ['Valencia centro', 'Naguanagua', 'San Diego', 'Los Guayos', 'Guacara', 'Bejuma'],
    delivery: 'Instalación en 2 a 5 días en el área metropolitana',
    note: 'Proyecto local: redes, equipos y servidores en oficina, con soporte a distancia.',
    latitude: 10.1838,
    longitude: -68.0039,
  },
  {
    slug: 'maracay',
    name: 'Maracay',
    state: 'Aragua',
    claim: 'Tecnología y equipos para comercios de Aragua',
    zones: ['Maracay centro', 'Girardot', 'Turmero', 'Cagua', 'Santa Rita', 'Choroní'],
    delivery: 'Instalación en 2 a 5 días en Maracay y alrededores',
    note: 'Mantenimiento y soporte para empresas con sucursales en el centro y la zona industrial.',
    latitude: 10.2469,
    longitude: -67.6066,
  },
  {
    slug: 'barquisimeto',
    name: 'Barquisimeto',
    state: 'Lara',
    claim: 'Equipos, redes y páginas web para negocios de Lara',
    zones: ['Barquisimeto centro', 'Iribarren', 'Palo Verde', 'Jiménez', 'Torres', 'El Tocuyo'],
    delivery: 'Entrega de 3 a 7 días según disponibilidad',
    note: 'Trabajamos con proveedores locales de hardware para reducir los tiempos de entrega.',
    latitude: 10.1011,
    longitude: -69.3294,
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
      'Los Puertos de Altagracia',
      'Catatumbo',
    ],
    delivery: 'Atención remota inmediata; instalación presencial en 3 a 6 días',
    note: 'El soporte remoto cubre toda la región; las visitas se coordinan con cita previa.',
    latitude: 10.6448,
    longitude: -71.6275,
  },
  {
    slug: 'puerto-cabello',
    name: 'Puerto Cabello',
    state: 'Carabobo',
    claim: 'Redes y equipos para la zona portuaria',
    zones: ['Puerto Cabello centro', 'San Esteban', 'Borburata', 'Morón', 'Güigüe', 'Naguanagua'],
    delivery: 'Instalación en 3 a 6 días',
    note: 'Proyectos de red y virtualización con atención en horario de oficina.',
    latitude: 10.4725,
    longitude: -68.0081,
  },
  {
    slug: 'la-victoria',
    name: 'La Victoria',
    state: 'Aragua',
    claim: 'Soporte y mantenimiento en el centro del país',
    zones: ['La Victoria centro', 'San Casimiro', 'San Sebastián', 'Villa de Cura', 'Zamora', 'El Limón'],
    delivery: 'Atención remota el mismo día; visita en 2 a 4 días',
    note: 'Plan de mantenimiento mensual para empresas con varias sedes en el estado.',
    latitude: 10.2306,
    longitude: -67.3333,
  },
  {
    slug: 'merida',
    name: 'Mérida',
    state: 'Mérida',
    claim: 'Sistemas y equipos para negocios de los Andes',
    zones: ['Mérida centro', 'Ejido', 'Tovar', 'Santa Cruz de Mora', 'Cardenal Quintero', 'Rangel'],
    delivery: 'Entrega en 4 a 8 días',
    note: 'Proyectos de software y automatización con alcance cerrado por etapas.',
    latitude: 8.0932,
    longitude: -71.3093,
  },
  {
    slug: 'barinas',
    name: 'Barinas',
    state: 'Barinas',
    claim: 'Automatización y páginas web para negocios de los llanos',
    zones: ['Barinas centro', 'Barinitas', 'Sabaneta', 'Santa Bárbara', 'Ciudad Bolivia', 'Obispos'],
    delivery: 'Atención remota inmediata; visita en 2 a 5 días',
    note: 'El soporte remoto cubre todo el estado; las visitas se coordinan con cita previa.',
    latitude: 8.6221,
    longitude: -70.2215,
  },
  {
    slug: 'guanare',
    name: 'Guanare',
    state: 'Portuguesa',
    claim: 'Equipos y redes para negocios de Portuguesa',
    zones: ['Guanare centro', 'Araure', 'Ospino', 'Guanarito', 'Píritu', 'Agua Blanca'],
    delivery: 'Entrega en 3 a 7 días según disponibilidad',
    note: 'Instalación de redes y entrega de equipos coordinada con proveedores locales.',
    latitude: 9.0606,
    longitude: -69.7466,
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

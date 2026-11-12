/** Temas de las ilustraciones propias del sitio. */
export type ArtworkTheme =
  | 'software'
  | 'whatsapp'
  | 'web'
  | 'marketing'
  | 'redes'
  | 'equipos'
  | 'paquetes'
  | 'clientes'
  | 'acerca';

/** Convierte el icono de un servicio en el tema de ilustración que le toca. */
export const ARTWORK_BY_ICON: Record<string, ArtworkTheme> = {
  code: 'software',
  bot: 'whatsapp',
  chat: 'whatsapp',
  layout: 'web',
  chart: 'marketing',
  network: 'redes',
  monitor: 'equipos',
};

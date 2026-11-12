/**
 * Registro de iconos del sitio.
 *
 * Todo en un solo lugar y agrupado por familia, para poder revisar de un
 * vistazo qué se usa, añadir nombres nuevos sin tocar el componente y
 * comprobar (con el test) que ninguna plantilla depende de un icono que no
 * exista. Los iconos de marca vienen de Simple Icons; el resto, de Lucide.
 */

export const ICON_GROUPS = {
  /** Servicios que se ofrecen (portafolio). */
  servicios: {
    code: 'lucide:code-xml',
    chat: 'lucide:messages-square',
    bot: 'lucide:bot',
    layout: 'lucide:layout-template',
    chart: 'lucide:trending-up',
    network: 'lucide:network',
    monitor: 'lucide:monitor-smartphone',
  },

  /** Interfaz general. */
  interfaz: {
    zap: 'lucide:zap',
    check: 'lucide:circle-check',
    'check-simple': 'lucide:check',
    'arrow-right': 'lucide:arrow-right',
    'arrow-up-right': 'lucide:arrow-up-right',
    'chevron-down': 'lucide:chevron-down',
    clock: 'lucide:clock',
    shield: 'lucide:shield-check',
    sparkles: 'lucide:sparkles',
    globe: 'lucide:globe',
    mail: 'lucide:mail',
    copy: 'lucide:copy',
    card: 'lucide:credit-card',
    menu: 'lucide:menu',
    close: 'lucide:x',
    plus: 'lucide:plus',
    bell: 'lucide:bell',
    share: 'lucide:share-2',
    minus: 'lucide:minus',
  },

  /** Comercio: catálogo, carrito y fichas. */
  comercio: {
    'shopping-cart': 'lucide:shopping-cart',
    'file-text': 'lucide:file-text',
    tag: 'lucide:tag',
    package: 'lucide:package',
    receipt: 'lucide:receipt',
  },

  /** Cuenta del cliente. */
  cuenta: {
    user: 'lucide:user',
    edit: 'lucide:pencil',
    lock: 'lucide:lock',
    'log-out': 'lucide:log-out',
    'log-in': 'lucide:log-in',
  },

  /** Marcas de destinos y redes sociales. */
  marcas: {
    whatsapp: 'simple-icons:whatsapp',
    binance: 'simple-icons:binance',
    paypal: 'simple-icons:paypal',
    google: 'simple-icons:google',
    instagram: 'simple-icons:instagram',
    linkedin: 'simple-icons:linkedin',
    facebook: 'simple-icons:facebook',
    x: 'simple-icons:x',
    telegram: 'simple-icons:telegram',
  },
} as const;

/** Todos los iconos, sin duplicados, listos para usar por nombre. */
export const ICONS = Object.assign(
  {},
  ...Object.values(ICON_GROUPS).map((group) => ({ ...group })),
) as Record<string, string>;

export type IconName = keyof typeof ICONS;

/** Devuelve el icono de Iconify; si el nombre no existe, avisa en consola. */
export function resolveIcon(name: string): string {
  const icon = ICONS[name];
  if (icon) return icon;
  console.warn(`[icon] "${name}" no está en el registro de iconos.`);
  return `lucide:${name}`;
}

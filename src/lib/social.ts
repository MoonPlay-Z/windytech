/**
 * Sistema de difusión social y SEO.
 *
 * Centraliza los enlaces para compartir productos, servicios, paquetes y
 * publicaciones en redes sociales, siempre con parámetros UTM para saber de
 * qué canal llega cada posible cliente.
 */

export type ShareChannel = 'whatsapp' | 'facebook' | 'linkedin' | 'x' | 'telegram' | 'email';

export type ShareLink = {
  id: ShareChannel;
  label: string;
  href: string;
  icon: string;
};

export type ShareCopy = {
  label: string;
  navLabel: string;
  whatsapp: string;
  facebook: string;
  linkedin: string;
  x: string;
  telegram: string;
  email: string;
  copy: string;
  copied: string;
  copyError: string;
  /** Etiqueta del botón que abre el menú de compartir. */
  share: string;
  shareTitle: string;
};

export const shareCopy: ShareCopy = {
    label: 'Comparte y consigue clientes',
    navLabel: 'Compartir en redes sociales',
    whatsapp: 'WhatsApp',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    x: 'X',
    telegram: 'Telegram',
    email: 'Correo',
    copy: 'Copiar enlace',
    copied: 'Enlace copiado',
    copyError: 'No se pudo copiar. Copia la dirección desde el navegador.',
    share: 'Compartir',
    shareTitle: 'Compartir en',
};

/**
 * Añade parámetros UTM al enlace para medir el canal de entrada.
 * `source` es la red (whatsapp, facebook...) y `campaign` el contenido.
 */
export function trackedUrl(
  url: string,
  source: string,
  campaign = 'share',
  medium = 'social',
): string {
  try {
    const target = new URL(url);
    target.searchParams.set('utm_source', source);
    target.searchParams.set('utm_medium', medium);
    target.searchParams.set('utm_campaign', campaign);
    return target.toString();
  } catch {
    return url;
  }
}

/** Enlace de WhatsApp con el mensaje ya escrito. */
export function whatsappShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export type ShareInput = {
  /** URL absoluta de la página que se comparte. */
  url: string;
  /** Título del recurso. */
  title: string;
  /** Texto que acompaña al enlace. */
  text?: string;
  /** Campaña UTM (por defecto, el propio recurso). */
  campaign?: string;
};

/**
 * Construye los enlaces de difusión de un recurso.
 * Los enlaces ya salen con UTM para que el tráfico se pueda atribuir.
 */
export function shareLinks(input: ShareInput): ShareLink[] {
  const { url, title, text, campaign = 'share' } = input;
  const copy = shareCopy;

  const build = (source: ShareChannel) => {
    const tracked = trackedUrl(url, source, campaign);
    const message = text ? `${text} ${tracked}` : `${title} ${tracked}`;
    return { tracked, message };
  };

  const whatsapp = build('whatsapp');
  const facebook = build('facebook');
  const linkedin = build('linkedin');
  const x = build('x');
  const telegram = build('telegram');

  return [
    {
      id: 'whatsapp',
      label: copy.whatsapp,
      icon: 'whatsapp',
      href: whatsappShareUrl(whatsapp.message),
    },
    {
      id: 'facebook',
      label: copy.facebook,
      icon: 'facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(facebook.tracked)}`,
    },
    {
      id: 'linkedin',
      label: copy.linkedin,
      icon: 'linkedin',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(linkedin.tracked)}`,
    },
    {
      id: 'x',
      label: copy.x,
      icon: 'x',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text ?? title)}&url=${encodeURIComponent(x.tracked)}`,
    },
    {
      id: 'telegram',
      label: copy.telegram,
      icon: 'telegram',
      href: `https://t.me/share/url?url=${encodeURIComponent(telegram.tracked)}&text=${encodeURIComponent(text ?? title)}`,
    },
    {
      id: 'email',
      label: copy.email,
      icon: 'mail',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
        text ? `${text} ${url}` : `${title} ${url}`,
      )}`,
    },
  ];
}

/** URL con UTM para los botones de WhatsApp (conversión a conversación). */
export function trackedWhatsappLink(message: string, campaign: string): string {
  const base = whatsappShareUrl(message);
  return `${base}${base.includes('?') ? '&' : '?'}utm_source=whatsapp&utm_medium=social&utm_campaign=${encodeURIComponent(campaign)}`;
}

/*
 * Tráfico orgánico: los buscadores no avisan de la visita, así que el
 * enlace se marca con UTM desde las consolas (Search Console, Bing Webmaster
 * Tools, Brave Webmaster Tools) para saber qué palabra y qué buscador traen
 * clientes reales.
 */
export type OrganicSource = 'google' | 'bing' | 'brave';

/** Enlace de la portada marcado como tráfico orgánico. */
export function organicUrl(
  source: OrganicSource,
  keyword: string,
  path = '/',
): string {
  return trackedUrl(
    path,
    source,
    keyword ? `seo-${keyword}` : 'seo',
    'organic',
  );
}

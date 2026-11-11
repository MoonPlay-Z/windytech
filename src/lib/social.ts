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
};

export const shareCopy: Record<'es' | 'en', ShareCopy> = {
  es: {
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
  },
  en: {
    label: 'Share and get customers',
    navLabel: 'Share on social media',
    whatsapp: 'WhatsApp',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    x: 'X',
    telegram: 'Telegram',
    email: 'Email',
    copy: 'Copy link',
    copied: 'Link copied',
    copyError: 'Could not copy. Copy the address from your browser.',
  },
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
  lang: 'es' | 'en';
  /** Campaña UTM (por defecto, el propio recurso). */
  campaign?: string;
};

/**
 * Construye los enlaces de difusión de un recurso.
 * Los enlaces ya salen con UTM para que el tráfico se pueda atribuir.
 */
export function shareLinks(input: ShareInput): ShareLink[] {
  const { url, title, text, lang, campaign = 'share' } = input;
  const copy = shareCopy[lang];

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
export function trackedWhatsappLink(
  message: string,
  campaign: string,
  lang: 'es' | 'en' = 'es',
): string {
  const base = whatsappShareUrl(message);
  const suffix = lang === 'es' ? 'es' : 'en';
  return `${base}${base.includes('?') ? '&' : '?'}utm_source=whatsapp&utm_medium=social&utm_campaign=${encodeURIComponent(campaign)}&lang=${suffix}`;
}

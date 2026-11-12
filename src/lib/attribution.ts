/**
 * Atribución: de qué campaña, red o fuente viene cada visita.
 *
 * Se guarda la primera vez que se llega con parámetros UTM (o utm_source /
 * ref / gclid) en una cookie de 60 días. Así, cuando el cliente deja su
 * consulta o se registra, sabemos qué canal lo trajo.
 */

export type Attribution = {
  source: string;
  campaign: string;
  medium: string;
};

const COOKIE = 'wt_attribution';
const DAYS = 60;

const UTM_PARAMS = ['utm_source', 'utm_campaign', 'utm_medium', 'ref', 'gclid', 'fbclid'];

export function readAttribution(): Attribution {
  if (typeof document === 'undefined') return { source: '', campaign: '', medium: '' };

  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl: Attribution = {
      source: params.get('utm_source') ?? params.get('ref') ?? params.get('gclid') ?? '',
      campaign: params.get('utm_campaign') ?? '',
      medium: params.get('utm_medium') ?? (params.get('utm_source') ? 'social' : ''),
    };

    const tieneUtm = UTM_PARAMS.some((key) => params.get(key));

    if (tieneUtm && fromUrl.source) {
      const valor = encodeURIComponent(JSON.stringify(fromUrl));
      document.cookie = `${COOKIE}=${valor}; path=/; max-age=${DAYS * 86400}; samesite=lax`;
      return fromUrl;
    }

    const guardada = readCookie();
    return guardada ?? { source: '', campaign: '', medium: '' };
  } catch {
    return { source: '', campaign: '', medium: '' };
  }
}

function readCookie(): Attribution | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  if (!match) return null;
  try {
    const value = JSON.parse(decodeURIComponent(match[1])) as Attribution;
    return {
      source: value.source ?? '',
      campaign: value.campaign ?? '',
      medium: value.medium ?? '',
    };
  } catch {
    return null;
  }
}

/** Publica la atribución en `window.windych` para que la usen los scripts. */
export function publishAttribution(): Attribution {
  const attribution = readAttribution();
  const w = window as Window & { windych?: Attribution };
  w.windych = attribution;
  return attribution;
}

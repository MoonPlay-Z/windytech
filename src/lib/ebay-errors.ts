/**
 * Errores de eBay con causa concreta. La capa HTTP devuelve `code` + `message`
 * para que el panel explique qué falló en lugar de un mensaje genérico.
 */

export type EbayErrorCode =
  | 'EBAY_NOT_CONFIGURED'
  | 'EBAY_BAD_CREDENTIALS'
  | 'EBAY_TOKEN_INVALID'
  | 'EBAY_TOKEN_EXPIRED'
  | 'EBAY_INVALID_GRANT'
  | 'EBAY_FORBIDDEN'
  | 'EBAY_RATE_LIMIT'
  | 'EBAY_ITEM_NOT_FOUND'
  | 'EBAY_BAD_REQUEST'
  | 'EBAY_UNAVAILABLE'
  | 'EBAY_INVALID_RESPONSE'
  | 'EBAY_NETWORK'
  | 'EBAY_LINK_INVALID'
  | 'EBAY_LINK_DOMAIN'
  | 'EBAY_LINK_UNRESOLVABLE'
  | 'EBAY_LINK_REDIRECT'
  | 'EBAY_UNKNOWN';

export class EbayError extends Error {
  readonly code: EbayErrorCode;
  /** Respuesta cruda de eBay para los logs (nunca se muestra al usuario). */
  readonly detail?: string;

  constructor(code: EbayErrorCode, message: string, detail?: string) {
    super(message);
    this.name = 'EbayError';
    this.code = code;
    this.detail = detail;
  }
}

type EbayApiErrorBody = {
  errors?: Array<{
    errorId?: number | string;
    message?: string;
    longMessage?: string;
    domain?: string;
    category?: string;
  }>;
  error?: string;
  error_description?: string;
  message?: string;
};

/** Convierte una respuesta de error de eBay en un error con causa legible. */
export function parseEbayApiError(status: number, body: string): EbayError {
  let apiMessage = '';
  let errorId = '';
  try {
    const data = JSON.parse(body) as EbayApiErrorBody;
    const first = data.errors?.[0];
    apiMessage = String(
      first?.longMessage ?? first?.message ?? data.error_description ?? data.message ?? data.error ?? '',
    ).trim();
    if (first?.errorId != null) errorId = String(first.errorId);
  } catch {
    // El cuerpo no es JSON (HTML de un proxy, por ejemplo).
  }

  const text = `${apiMessage} ${body}`.toLowerCase();
  const detail = body.slice(0, 500);
  const suffix = apiMessage ? ` eBay indicó: «${apiMessage}».` : '';
  const withId = errorId ? ` (error ${errorId})` : '';

  if (/invalid_client|client authentication failed/i.test(text)) {
    return new EbayError(
      'EBAY_BAD_CREDENTIALS',
      'Las credenciales de eBay (EBAY_CLIENT_ID y EBAY_CLIENT_SECRET) no son válidas. Genéralas de nuevo en el Developer Portal y actualízalas en Render → Environment. Comprueba también que EBAY_SANDBOX coincida (credenciales SBX → true, PRD → false).',
      detail,
    );
  }
  if (status === 401 || /invalid access token|access token.*invalid|token.*invalid/i.test(text)) {
    return new EbayError(
      /expir/i.test(text) ? 'EBAY_TOKEN_EXPIRED' : 'EBAY_TOKEN_INVALID',
      'El token de acceso de eBay no es válido o ha caducado. Actualiza EBAY_REFRESH_TOKEN (o EBAY_ACCESS_TOKEN si lo usas) en el entorno y vuelve a intentarlo.',
      detail,
    );
  }
  if (/expir/i.test(text) && /token/i.test(text)) {
    return new EbayError(
      'EBAY_TOKEN_EXPIRED',
      'El refresh token de eBay ha caducado. Genera uno nuevo desde el portal de desarrollador y actualiza EBAY_REFRESH_TOKEN.',
      detail,
    );
  }
  if (/invalid_grant/i.test(text)) {
    return new EbayError(
      'EBAY_INVALID_GRANT',
      'eBay rechazó la autorización (invalid_grant). Si renuevas el token, actualiza EBAY_REFRESH_TOKEN; si estás dando el consentimiento, genera un código nuevo desde el Developer Portal.',
      detail,
    );
  }
  if (status === 403 || /forbidden|insufficient scope|not authorized|missing scope/i.test(text)) {
    return new EbayError(
      'EBAY_FORBIDDEN',
      `eBay denegó el acceso por permisos. Revisa EBAY_OAUTH_SCOPE y los permisos de la cuenta de desarrollador.${suffix}`,
      detail,
    );
  }
  if (status === 429 || /rate limit|too many requests/i.test(text)) {
    return new EbayError(
      'EBAY_RATE_LIMIT',
      'eBay ha alcanzado el límite de peticiones. Espera unos minutos y vuelve a intentarlo.',
      detail,
    );
  }
  if (status === 404 || /not found|no items? (?:found|exist)/i.test(text)) {
    return new EbayError(
      'EBAY_ITEM_NOT_FOUND',
      `eBay no encontró el producto. Puede estar vendido, retirado o el enlace ya no ser válido.${withId}`,
      detail,
    );
  }
  if (status >= 500) {
    return new EbayError(
      'EBAY_UNAVAILABLE',
      `eBay no está disponible en este momento (HTTP ${status}). Inténtalo de nuevo en unos minutos.`,
      detail,
    );
  }
  return new EbayError(
    'EBAY_BAD_REQUEST',
    `eBay rechazó la solicitud (HTTP ${status}).${suffix} Revisa los datos enviados.`,
    detail,
  );
}

/** Mensaje seguro para mostrar en el panel, sea cual sea el origen del error. */
export function ebayErrorMessage(error: unknown): { code: EbayErrorCode; message: string } {
  if (error instanceof EbayError) return { code: error.code, message: error.message };
  const message = error instanceof Error ? error.message : '';
  return {
    code: 'EBAY_UNKNOWN',
    message: message || 'Ocurrió un error inesperado con eBay. Revisa los logs del servidor.',
  };
}

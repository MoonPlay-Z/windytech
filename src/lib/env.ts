/** Acceso centralizado a variables de entorno del servidor. */

function read(name: string): string {
  return (process.env[name] ?? '').trim();
}

export const serverEnv = {
  get databaseUrl() {
    return read('DATABASE_URL');
  },
  get sessionSecret() {
    return read('SESSION_SECRET') || 'windytech-dev-session-secret-change-me';
  },
  get siteUrl() {
    return (read('PUBLIC_SITE_URL') || 'https://windytech.studio').replace(/\/$/, '');
  },
  get cloudName() {
    return read('PUBLIC_CLOUDINARY_CLOUD_NAME');
  },
  get cloudinaryKey() {
    return read('CLOUDINARY_API_KEY');
  },
  get cloudinarySecret() {
    return read('CLOUDINARY_API_SECRET');
  },
  get bootstrapEmail() {
    return read('ADMIN_BOOTSTRAP_EMAIL');
  },
  get bootstrapPassword() {
    return read('ADMIN_BOOTSTRAP_PASSWORD');
  },
  get resendKey() {
    return read('RESEND_API_KEY');
  },
  /** Remitente de los correos (opcional: sin él, el aviso solo va al panel). */
  get mailFrom() {
    return read('MAIL_FROM');
  },
  get adminNotifyEmail() {
    return read('ADMIN_NOTIFICACION_EMAIL');
  },
  get isProduction() {
    return read('NODE_ENV') === 'production';
  },
  /** eBay: credenciales del desarrollador y token de refresco del usuario. */
  get ebayClientId() {
    return read('EBAY_CLIENT_ID');
  },
  get ebayClientSecret() {
    return read('EBAY_CLIENT_SECRET');
  },
  /** true = Sandbox de eBay, false = Producción. */
  get ebaySandbox() {
    return read('EBAY_SANDBOX') !== 'false';
  },
  get ebayRedirectUri() {
    return read('EBAY_REDIRECT_URI');
  },
  get ebayRefreshToken() {
    return read('EBAY_REFRESH_TOKEN');
  },
  get ebayDevId() {
    return read('EBAY_DEV_ID');
  },
  /** Scope OAuth requerido para publicar en eBay (ej: https://api.ebay.com/oauth/api_scope/sell.item). */
  get ebayOAuthScope() {
    return read('EBAY_OAUTH_SCOPE') || 'https://api.ebay.com/oauth/api_scope/sell.item';
  },
};

export const SESSION_COOKIE = 'wt_admin';
export const SESSION_HOURS = 8;

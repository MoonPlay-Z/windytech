import { availabilityLabels, conditionLabels } from './catalog';

/** Etiquetas en español para los roles de administrador del panel. */
export const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Propietario',
  EDITOR: 'Editor',
};

/** Etiquetas en español para los tipos de promoción. */
export const PROMOTION_TYPE_LABELS: Record<string, string> = {
  PERCENT: 'Porcentaje',
  FIXED: 'Monto fijo',
};

/** Etiquetas en español para el estado de una cotización. */
export const QUOTE_STATUS_LABELS: Record<string, string> = {
  NEW: 'Nueva',
  CONTACTED: 'Contactada',
  QUOTED: 'Cotizada',
  CLOSED: 'Cerrada',
  LOST: 'Perdida',
};

export const roleLabel = (role: string): string => ROLE_LABELS[role] ?? role;

export const availabilityLabel = (value: string): string =>
  availabilityLabels[value as keyof typeof availabilityLabels] ?? value;

export const conditionLabel = (value: string): string =>
  conditionLabels[value as keyof typeof conditionLabels] ?? value;

export const promotionTypeLabel = (value: string): string => PROMOTION_TYPE_LABELS[value] ?? value;

/** Muestra el valor de una promoción: porcentaje o monto en dólares. */
export const promotionValueLabel = (type: string, value: number): string =>
  type === 'FIXED' ? `USD ${(value / 100).toFixed(2)}` : `${value}%`;

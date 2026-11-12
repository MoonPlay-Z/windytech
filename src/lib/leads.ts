/**
 * Leads: consultas que llegan por el formulario de contacto.
 *
 * Un lead es la primera señal de interés. Puede convertirse en una cotización
 * o en un seguimiento, y guarda de qué campaña o red vino (atribución UTM).
 */

export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost';

export const LEAD_STATUS: Record<
  LeadStatus,
  { label: string; tone: 'neutral' | 'info' | 'warning' | 'success' | 'danger' }
> = {
  new: { label: 'Nuevo', tone: 'info' },
  contacted: { label: 'Contactado', tone: 'warning' },
  quoted: { label: 'Cotizado', tone: 'warning' },
  won: { label: 'Convertido', tone: 'success' },
  lost: { label: 'Descartado', tone: 'danger' },
};

export const LEAD_STATUS_LIST = Object.entries(LEAD_STATUS).map(([id, meta]) => ({
  id,
  ...meta,
}));

export function isLeadStatus(value: string): value is LeadStatus {
  return value in LEAD_STATUS;
}

export type LeadRow = {
  id: number;
  name: string;
  business: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  channel: string;
  source: string;
  campaign: string;
  status: string;
  customerId: number | null;
  trackingId: number | null;
  createdAt: string;
  updatedAt: string;
};

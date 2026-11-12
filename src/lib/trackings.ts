/**
 * Catálogo de seguimientos.
 *
 * Un mismo módulo sirve para servicios, suscripciones, proyectos, cotizaciones
 * y equipos comprados: cada tipo tiene sus estados y el cliente los ve
 * todos juntos en su panel.
 */

export type TrackingKind = 'service' | 'subscription' | 'project' | 'quote' | 'equipment';

export type TrackingStatus = {
  id: string;
  label: string;
  /** 0-100: se usa como avance por defecto al entrar en el estado. */
  progress: number;
  tone: 'neutral' | 'info' | 'warning' | 'success' | 'danger';
};

export type TrackingKindMeta = {
  id: TrackingKind;
  label: string;
  plural: string;
  icon: string;
  description: string;
  statuses: TrackingStatus[];
};

export const TRACKING_KINDS: Record<TrackingKind, TrackingKindMeta> = {
  service: {
    id: 'service',
    label: 'Servicio',
    plural: 'Servicios solicitados',
    icon: 'code',
    description: 'Desarrollo de software, automatización, webs, marketing y redes.',
    statuses: [
      { id: 'solicitado', label: 'Solicitado', progress: 5, tone: 'neutral' },
      { id: 'diagnostico', label: 'En diagnóstico', progress: 20, tone: 'info' },
      { id: 'ejecucion', label: 'En ejecución', progress: 55, tone: 'info' },
      { id: 'pruebas', label: 'En pruebas', progress: 80, tone: 'warning' },
      { id: 'entregado', label: 'Entregado', progress: 100, tone: 'success' },
      { id: 'cancelado', label: 'Cancelado', progress: 0, tone: 'danger' },
    ],
  },
  subscription: {
    id: 'subscription',
    label: 'Suscripción',
    plural: 'Suscripciones',
    icon: 'card',
    description: 'Planes de mantenimiento, soporte o gestión mensual.',
    statuses: [
      { id: 'pago_pendiente', label: 'Pago pendiente', progress: 10, tone: 'warning' },
      { id: 'activa', label: 'Activa', progress: 60, tone: 'success' },
      { id: 'pausada', label: 'Pausada', progress: 40, tone: 'neutral' },
      { id: 'cancelada', label: 'Cancelada', progress: 0, tone: 'danger' },
    ],
  },
  project: {
    id: 'project',
    label: 'Proyecto',
    plural: 'Proyectos en marcha',
    icon: 'layout',
    description: 'Proyectos entregados por etapas, con hitos y seguimiento.',
    statuses: [
      { id: 'planificacion', label: 'En planificación', progress: 15, tone: 'neutral' },
      { id: 'desarrollo', label: 'En desarrollo', progress: 50, tone: 'info' },
      { id: 'pruebas', label: 'En pruebas', progress: 80, tone: 'warning' },
      { id: 'entregado', label: 'Entregado', progress: 100, tone: 'success' },
    ],
  },
  quote: {
    id: 'quote',
    label: 'Cotización',
    plural: 'Cotizaciones',
    icon: 'file-text',
    description: 'Presupuestos enviados y su estado de negociación.',
    statuses: [
      { id: 'recibida', label: 'Recibida', progress: 15, tone: 'neutral' },
      { id: 'contactada', label: 'Te contactamos', progress: 35, tone: 'info' },
      { id: 'cotizada', label: 'Enviada', progress: 55, tone: 'info' },
      { id: 'aceptada', label: 'Aceptada', progress: 100, tone: 'success' },
      { id: 'rechazada', label: 'No aceptada', progress: 0, tone: 'danger' },
    ],
  },
  equipment: {
    id: 'equipment',
    label: 'Equipo',
    plural: 'Equipos comprados',
    icon: 'monitor',
    description: 'Seguimiento de los equipos que compraste: pagado, preparando, en camino o entregado.',
    statuses: [
      { id: 'pagado', label: 'Pagado', progress: 25, tone: 'success' },
      { id: 'preparando', label: 'Preparando', progress: 55, tone: 'warning' },
      { id: 'en_camino', label: 'En camino', progress: 80, tone: 'info' },
      { id: 'entregado', label: 'Entregado', progress: 100, tone: 'success' },
    ],
  },
};

export const TRACKING_KIND_LIST = Object.values(TRACKING_KINDS);

export function trackingMeta(kind: string): TrackingKindMeta {
  return TRACKING_KINDS[kind as TrackingKind] ?? TRACKING_KINDS.service;
}

export function trackingStatus(kind: string, status: string): TrackingStatus | null {
  return trackingMeta(kind).statuses.find((item) => item.id === status) ?? null;
}

/** Estados de un tipo, para validar lo que llega del formulario o la API. */
export function isValidTrackingStatus(kind: string, status: string): boolean {
  return trackingMeta(kind).statuses.some((item) => item.id === status);
}

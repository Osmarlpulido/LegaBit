/**
 * Eventos server-side para PostHog u otros proveedores.
 * Enviar solo propiedades no sensibles; `organizationId` como clave de agregación.
 */
export type AnalyticsEvent = {
  name: string;
  distinctId: string;
  properties?: Record<string, string | number | boolean | null>;
};

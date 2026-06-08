/**
 * Contratos e IDs de flujos disparados vía n8n / webhooks.
 * Implementación: llamadas idempotentes a APIs internas con service account.
 */
export const workflowEventTypes = [
  "organization.created",
  "member.invited",
  "stripe.subscription.updated",
  "certificate.issued"
] as const;

export type WorkflowEventType = (typeof workflowEventTypes)[number];

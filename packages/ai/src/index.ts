/**
 * Casos de uso acotados de IA. LangChain solo dentro de estos límites.
 * La lógica de negocio y permisos vive fuera de este paquete.
 */
export const boundedAiUseCases = [
  "summarization",
  "classification",
  "extraction",
  "drafting",
  "semantic_retrieval"
] as const;

export type BoundedAiUseCase = (typeof boundedAiUseCases)[number];

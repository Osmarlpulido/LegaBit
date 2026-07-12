import { type ZodTypeAny } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export function toOpenApiSchema(schema: ZodTypeAny): Record<string, unknown> {
  return zodToJsonSchema(schema, {
    $refStrategy: "none",
    target: "openApi3"
  }) as Record<string, unknown>;
}

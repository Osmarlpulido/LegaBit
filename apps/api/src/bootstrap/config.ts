import { z } from "zod";

const environmentSchema = z.enum(["development", "test", "production"]);

const configSchema = z.object({
  NODE_ENV: environmentSchema.default("development"),
  API_HOST: z.string().min(1).default("0.0.0.0"),
  API_PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  MONGODB_URI: z.string().min(1),
  MONGODB_DATABASE: z.string().min(1).default("legabit")
});

export type ApiConfig = z.infer<typeof configSchema>;

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): ApiConfig {
  const result = configSchema.safeParse(environment);

  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join(".") || "environment");
    throw new Error(`Invalid API configuration: ${[...new Set(fields)].join(", ")}`);
  }

  return result.data;
}

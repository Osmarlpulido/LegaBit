import { z } from "zod";

const environmentSchema = z.enum(["development", "test", "production"]);

const configSchema = z.object({
  NODE_ENV: environmentSchema.default("development"),
  API_HOST: z.string().min(1).default("0.0.0.0"),
  API_PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  MONGODB_URI: z.string().min(1),
  MONGODB_DATABASE: z.string().min(1).default("legabit"),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  AUTH_TRUSTED_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean))
    .pipe(z.array(z.string().url()).min(1)),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional()
}).superRefine((config, context) => {
  if (Boolean(config.GOOGLE_CLIENT_ID) !== Boolean(config.GOOGLE_CLIENT_SECRET)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Google OAuth client ID and secret must be configured together.",
      path: [config.GOOGLE_CLIENT_ID ? "GOOGLE_CLIENT_SECRET" : "GOOGLE_CLIENT_ID"]
    });
  }

  if (config.NODE_ENV === "production") {
    const insecureUrls = [config.BETTER_AUTH_URL, ...config.AUTH_TRUSTED_ORIGINS]
      .filter((url) => !url.startsWith("https://"));
    if (insecureUrls.length > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Production authentication URLs must use HTTPS.",
        path: ["BETTER_AUTH_URL"]
      });
    }
  }
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

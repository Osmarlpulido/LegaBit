import {
  apiErrorSchema,
  healthLiveResponseSchema,
  healthReadyResponseSchema
} from "@legabit/api-contracts";
import Fastify, { type FastifyInstance } from "fastify";

import type { DatabaseHealth } from "../infrastructure/mongodb.js";

type AppOptions = {
  database: DatabaseHealth;
  logger?: boolean | { level: string };
};

export function createApp(options: AppOptions): FastifyInstance {
  const app = Fastify({
    logger: options.logger ?? true,
    requestIdHeader: "x-request-id"
  });

  app.get("/health/live", async () => {
    return healthLiveResponseSchema.parse({ status: "ok" });
  });

  app.get("/health/ready", async (_request, reply) => {
    try {
      await options.database.check();
      return healthReadyResponseSchema.parse({ status: "ready", dependencies: { mongodb: "up" } });
    } catch (error) {
      app.log.warn({ err: error }, "Readiness check failed");
      const body = apiErrorSchema.parse({
        code: "SERVICE_UNAVAILABLE",
        message: "The service is not ready to accept traffic.",
        requestId: reply.request.id
      });
      return reply.status(503).send(body);
    }
  });

  app.setNotFoundHandler((request, reply) => {
    const body = apiErrorSchema.parse({
      code: "NOT_FOUND",
      message: "Route not found.",
      requestId: request.id
    });
    return reply.status(404).send(body);
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, "Unhandled request error");
    const body = apiErrorSchema.parse({
      code: "INTERNAL",
      message: "An unexpected error occurred.",
      requestId: request.id
    });
    return reply.status(500).send(body);
  });

  return app;
}

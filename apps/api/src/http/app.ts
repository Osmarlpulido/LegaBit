import {
  apiErrorSchema,
  currentUserResponseSchema,
  healthLiveResponseSchema,
  healthReadyResponseSchema,
  toOpenApiSchema
} from "@legabit/api-contracts";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import Fastify, { type FastifyInstance } from "fastify";

import type { DatabaseHealth } from "../infrastructure/mongodb.js";
import type { AuthService } from "../modules/identity/auth.js";
import { registerAuthRoutes, toAuthHeaders } from "./auth-handler.js";

type AppOptions = {
  database: DatabaseHealth;
  auth: AuthService;
  trustedOrigins?: string[];
  logger?: boolean | { level: string };
};

export function createApp(options: AppOptions): FastifyInstance {
  const app = Fastify({
    logger: options.logger ?? true,
    requestIdHeader: "x-request-id"
  });

  void app.register(cors, {
    origin: options.trustedOrigins ?? ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["content-type", "authorization", "x-request-id"]
  });

  void app.register(swagger, {
    openapi: {
      info: {
        title: "LegaBit API",
        description: "Versioned contracts for the LegaBit backend.",
        version: "1.0.0"
      },
      tags: [
        { name: "health", description: "Service liveness and readiness" },
        { name: "identity", description: "Authenticated actor information" }
      ]
    }
  });

  app.after(() => {
    registerAuthRoutes(app, options.auth);

    app.get("/health/live", {
      schema: {
        operationId: "getHealthLive",
        summary: "Check process liveness",
        tags: ["health"],
        response: { 200: toOpenApiSchema(healthLiveResponseSchema) }
      }
    }, async () => {
      return healthLiveResponseSchema.parse({ status: "ok" });
    });

    app.get("/health/ready", {
      schema: {
        operationId: "getHealthReady",
        summary: "Check required dependencies",
        tags: ["health"],
        response: {
          200: toOpenApiSchema(healthReadyResponseSchema),
          503: toOpenApiSchema(apiErrorSchema)
        }
      }
    }, async (_request, reply) => {
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

    app.get("/api/v1/me", {
      schema: {
        operationId: "getCurrentUser",
        summary: "Get the authenticated user",
        tags: ["identity"],
        response: {
          200: toOpenApiSchema(currentUserResponseSchema),
          401: toOpenApiSchema(apiErrorSchema)
        }
      }
    }, async (request, reply) => {
      const session = await options.auth.getSession(toAuthHeaders(request));
      if (!session) {
        const body = apiErrorSchema.parse({
          code: "UNAUTHORIZED",
          message: "Authentication is required.",
          requestId: request.id
        });
        return reply.status(401).send(body);
      }

      return currentUserResponseSchema.parse({
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image ?? null
        },
        session: { expiresAt: session.session.expiresAt.toISOString() }
      });
    });
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

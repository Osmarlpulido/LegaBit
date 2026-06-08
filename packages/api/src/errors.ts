import { z } from "zod";

export const errorCodes = [
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION_ERROR",
  "CONFLICT",
  "RATE_LIMITED",
  "INTERNAL"
] as const;

export type ErrorCode = (typeof errorCodes)[number];

export const apiErrorSchema = z.object({
  code: z.enum(errorCodes),
  message: z.string(),
  details: z.record(z.unknown()).optional()
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, options?: { status?: number; details?: Record<string, unknown> }) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = options?.status ?? statusForCode(code);
    this.details = options?.details;
  }
}

function statusForCode(code: ErrorCode): number {
  switch (code) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "VALIDATION_ERROR":
      return 422;
    case "CONFLICT":
      return 409;
    case "RATE_LIMITED":
      return 429;
    default:
      return 500;
  }
}

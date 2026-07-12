import { apiErrorSchema, type ApiError } from "@legabit/api-contracts";

type ResponseSchema<T> = {
  safeParse(value: unknown):
    | { success: true; data: T }
    | { success: false; error: { message: string } };
};

export type ApiRequestOptions<T> = Omit<RequestInit, "body"> & {
  body?: BodyInit | null;
  requestId?: string;
  schema: ResponseSchema<T>;
  timeoutMs?: number;
};

export class ApiClientError extends Error {
  readonly code: ApiError["code"];
  readonly details?: Record<string, unknown>;
  readonly requestId?: string;
  readonly status: number;

  constructor(error: ApiError, status: number) {
    super(error.message);
    this.name = "ApiClientError";
    this.code = error.code;
    this.details = error.details;
    this.requestId = error.requestId;
    this.status = status;
  }
}

const DEFAULT_TIMEOUT_MS = 10_000;

function createRequestId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function resolveUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "") ?? "";
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function combineSignals(timeoutSignal: AbortSignal, signal?: AbortSignal | null): AbortSignal {
  return signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

export async function apiRequest<T>(
  path: string,
  { requestId = createRequestId(), schema, timeoutMs = DEFAULT_TIMEOUT_MS, ...init }: ApiRequestOptions<T>
): Promise<T> {
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), timeoutMs);
  const headers = new Headers(init.headers);
  headers.set("x-request-id", requestId);

  try {
    const response = await fetch(resolveUrl(path), {
      ...init,
      credentials: init.credentials ?? "include",
      headers,
      signal: combineSignals(timeoutController.signal, init.signal)
    });
    const body = await readJson(response);

    if (!response.ok) {
      const parsedError = apiErrorSchema.safeParse(body);
      throw new ApiClientError(
        parsedError.success
          ? parsedError.data
          : {
              code: response.status === 429 ? "RATE_LIMITED" : "INTERNAL",
              message: `Request failed with status ${response.status}.`,
              requestId
            },
        response.status
      );
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new ApiClientError(
        {
          code: "INTERNAL",
          message: "The API returned an invalid response.",
          requestId
        },
        response.status
      );
    }

    return parsed.data;
  } catch (error) {
    if (timeoutController.signal.aborted) {
      throw new ApiClientError(
        { code: "SERVICE_UNAVAILABLE", message: "The request timed out.", requestId },
        0
      );
    }
    if (error instanceof ApiClientError || init.signal?.aborted) {
      throw error;
    }
    throw new ApiClientError(
      { code: "SERVICE_UNAVAILABLE", message: "Unable to reach the API.", requestId },
      0
    );
  } finally {
    clearTimeout(timeout);
  }
}

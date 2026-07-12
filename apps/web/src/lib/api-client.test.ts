import assert from "node:assert/strict";
import { afterEach, it } from "node:test";

import { ApiClientError, apiRequest } from "./api-client.js";

const originalFetch = globalThis.fetch;
const schema = {
  safeParse(value: unknown) {
    return typeof value === "object" && value !== null
      ? { success: true as const, data: value }
      : { success: false as const, error: { message: "invalid" } };
  }
};

afterEach(() => {
  globalThis.fetch = originalFetch;
});

it("forwards caller cancellation without requiring AbortSignal.any", async () => {
  const controller = new AbortController();
  const reason = new DOMException("cancelled", "AbortError");
  globalThis.fetch = async (_input, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
  });

  const request = apiRequest("/test", { schema, signal: controller.signal });
  controller.abort(reason);

  await assert.rejects(request, (error: unknown) => error === reason);
});

it("maps an internal timeout to a safe service-unavailable error", async () => {
  globalThis.fetch = async (_input, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true });
  });

  await assert.rejects(
    apiRequest("/test", { schema, timeoutMs: 1 }),
    (error: unknown) =>
      error instanceof ApiClientError &&
      error.code === "SERVICE_UNAVAILABLE" &&
      error.status === 0 &&
      error.message === "The request timed out."
  );
});

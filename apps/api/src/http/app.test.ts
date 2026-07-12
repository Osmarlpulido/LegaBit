import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createApp } from "./app.js";

describe("health routes", () => {
  it("reports process liveness without checking dependencies", async () => {
    const app = createApp({
      database: { check: async () => Promise.reject(new Error("must not run")) },
      logger: false
    });

    const response = await app.inject({ method: "GET", url: "/health/live" });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { status: "ok" });
    await app.close();
  });

  it("reports readiness when MongoDB responds", async () => {
    const app = createApp({ database: { check: async () => undefined }, logger: false });

    const response = await app.inject({ method: "GET", url: "/health/ready" });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { status: "ready", dependencies: { mongodb: "up" } });
    await app.close();
  });

  it("rejects traffic when MongoDB is unavailable", async () => {
    const app = createApp({
      database: { check: async () => Promise.reject(new Error("offline")) },
      logger: false
    });

    const response = await app.inject({ method: "GET", url: "/health/ready" });

    assert.equal(response.statusCode, 503);
    assert.equal(response.json().code, "SERVICE_UNAVAILABLE");
    assert.equal(typeof response.json().requestId, "string");
    await app.close();
  });
});

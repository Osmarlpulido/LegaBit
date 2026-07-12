import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createApp } from "./app.js";
import type { AuthService, CurrentAuthSession } from "../modules/identity/auth.js";

function createAuth(session: CurrentAuthSession | null = null): AuthService {
  return {
    handler: async () => new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json", "set-cookie": "auth=value; HttpOnly" }
    }),
    getSession: async () => session
  };
}

describe("health routes", () => {
  it("publishes the versioned route schemas through OpenAPI", async () => {
    const app = createApp({
      auth: createAuth(),
      database: { check: async () => undefined },
      logger: false
    });

    await app.ready();
    const document = app.swagger();

    assert.ok(document.paths);
    assert.ok(document.paths["/health/live"]);
    assert.ok(document.paths["/health/ready"]);
    assert.ok(document.paths["/api/v1/me"]);
    assert.ok(document.paths["/api/v1/markets"]);
    await app.close();
  });

  it("reports process liveness without checking dependencies", async () => {
    const app = createApp({
      auth: createAuth(),
      database: { check: async () => Promise.reject(new Error("must not run")) },
      logger: false
    });

    const response = await app.inject({ method: "GET", url: "/health/live" });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { status: "ok" });
    await app.close();
  });

  it("reports readiness when MongoDB responds", async () => {
    const app = createApp({
      auth: createAuth(),
      database: { check: async () => undefined },
      logger: false
    });

    const response = await app.inject({ method: "GET", url: "/health/ready" });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { status: "ready", dependencies: { mongodb: "up" } });
    await app.close();
  });

  it("rejects traffic when MongoDB is unavailable", async () => {
    const app = createApp({
      auth: createAuth(),
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

describe("authentication routes", () => {
  it("forwards auth responses and cookies", async () => {
    const app = createApp({
      auth: createAuth(),
      database: { check: async () => undefined },
      logger: false
    });

    const response = await app.inject({ method: "GET", url: "/api/auth/ok" });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { ok: true });
    assert.match(String(response.headers["set-cookie"]), /HttpOnly/);
    await app.close();
  });

  it("rejects unauthenticated current-user requests", async () => {
    const app = createApp({
      auth: createAuth(),
      database: { check: async () => undefined },
      logger: false
    });

    const response = await app.inject({ method: "GET", url: "/api/v1/me" });

    assert.equal(response.statusCode, 401);
    assert.equal(response.json().code, "UNAUTHORIZED");
    await app.close();
  });

  it("returns the authenticated user through an application-owned contract", async () => {
    const app = createApp({
      auth: createAuth({
        user: { id: "user-1", email: "user@example.com", name: "LegaBit User" },
        session: { id: "session-1", expiresAt: new Date("2030-01-01T00:00:00.000Z") }
      }),
      database: { check: async () => undefined },
      logger: false
    });

    const response = await app.inject({ method: "GET", url: "/api/v1/me" });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {
      user: { id: "user-1", email: "user@example.com", name: "LegaBit User", image: null },
      session: { expiresAt: "2030-01-01T00:00:00.000Z" }
    });
    await app.close();
  });
});

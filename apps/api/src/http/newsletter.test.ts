import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SubscribeNewsletter } from "../modules/newsletter/newsletter.js";
import { createApp } from "./app.js";

const auth = { handler: async () => new Response(null), getSession: async () => null };

describe("POST /api/v1/newsletter/subscriptions", () => {
  it("validates and subscribes through the application boundary", async () => {
    let received: unknown;
    const app = createApp({
      auth,
      database: { check: async () => undefined },
      logger: false,
      newsletter: new SubscribeNewsletter({
        subscribe: async (subscription) => { received = subscription; return { alreadySubscribed: false }; }
      }, () => new Date("2026-07-12T00:00:00.000Z"))
    });
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/newsletter/subscriptions",
      payload: { email: "PERSON@EXAMPLE.COM", displayName: " Person ", phone: "+57 300 000 0000", source: "landing" }
    });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().alreadySubscribed, false);
    assert.deepEqual(received, {
      email: "person@example.com", displayName: "Person", phone: "+57 300 000 0000", source: "landing",
      subscribedAt: new Date("2026-07-12T00:00:00.000Z")
    });
    await app.close();
  });

  it("rejects malformed subscriptions before repository access", async () => {
    let called = false;
    const app = createApp({
      auth, database: { check: async () => undefined }, logger: false,
      newsletter: new SubscribeNewsletter({ subscribe: async () => { called = true; return { alreadySubscribed: false }; } })
    });
    const response = await app.inject({ method: "POST", url: "/api/v1/newsletter/subscriptions", payload: { email: "bad" } });
    assert.equal(response.statusCode, 422);
    assert.equal(response.json().code, "VALIDATION_ERROR");
    assert.equal(called, false);
    await app.close();
  });
});

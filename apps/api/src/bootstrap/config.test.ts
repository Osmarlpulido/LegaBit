import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadConfig } from "./config.js";

describe("API configuration", () => {
  it("loads safe defaults when required MongoDB configuration exists", () => {
    const config = loadConfig({
      MONGODB_URI: "mongodb://localhost:27017",
      BETTER_AUTH_SECRET: "test-secret-that-is-at-least-32-characters"
    });

    assert.equal(config.API_HOST, "0.0.0.0");
    assert.equal(config.API_PORT, 4000);
    assert.equal(config.MONGODB_DATABASE, "legabit");
    assert.equal(config.BETTER_AUTH_URL, "http://localhost:3000");
    assert.deepEqual(config.AUTH_TRUSTED_ORIGINS, ["http://localhost:3000"]);
  });

  it("fails fast without exposing configuration values", () => {
    assert.throws(
      () => loadConfig({
        MONGODB_URI: "",
        API_PORT: "invalid-secret-value",
        BETTER_AUTH_SECRET: "short"
      }),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.match(error.message, /MONGODB_URI/);
        assert.match(error.message, /API_PORT/);
        assert.match(error.message, /BETTER_AUTH_SECRET/);
        assert.doesNotMatch(error.message, /invalid-secret-value/);
        return true;
      }
    );
  });

  it("requires Google OAuth credentials as a pair", () => {
    assert.throws(
      () => loadConfig({
        MONGODB_URI: "mongodb://localhost:27017",
        BETTER_AUTH_SECRET: "test-secret-that-is-at-least-32-characters",
        GOOGLE_CLIENT_ID: "google-client-id"
      }),
      /GOOGLE_CLIENT_SECRET/
    );
  });

  it("requires HTTPS authentication origins in production", () => {
    assert.throws(
      () => loadConfig({
        NODE_ENV: "production",
        MONGODB_URI: "mongodb://localhost:27017",
        BETTER_AUTH_SECRET: "test-secret-that-is-at-least-32-characters",
        BETTER_AUTH_URL: "http://api.example.com",
        AUTH_TRUSTED_ORIGINS: "https://app.example.com"
      }),
      /BETTER_AUTH_URL/
    );
  });
});

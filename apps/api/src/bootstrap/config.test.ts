import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadConfig } from "./config.js";

describe("API configuration", () => {
  it("loads safe defaults when required MongoDB configuration exists", () => {
    const config = loadConfig({ MONGODB_URI: "mongodb://localhost:27017" });

    assert.equal(config.API_HOST, "0.0.0.0");
    assert.equal(config.API_PORT, 4000);
    assert.equal(config.MONGODB_DATABASE, "legabit");
  });

  it("fails fast without exposing configuration values", () => {
    assert.throws(
      () => loadConfig({ MONGODB_URI: "", API_PORT: "invalid-secret-value" }),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.match(error.message, /MONGODB_URI/);
        assert.match(error.message, /API_PORT/);
        assert.doesNotMatch(error.message, /invalid-secret-value/);
        return true;
      }
    );
  });
});

import assert from "node:assert/strict";
import { it } from "node:test";

import { loadConfig } from "../bootstrap/config.js";
import { MongoDatabase } from "../infrastructure/mongodb.js";
import { createAuthService } from "../modules/identity/auth.js";
import { createApp } from "./app.js";

it("mounts the real Better Auth handler in Fastify", async () => {
  const config = loadConfig({
    NODE_ENV: "test",
    MONGODB_URI: "mongodb://127.0.0.1:1",
    BETTER_AUTH_SECRET: "test-secret-that-is-at-least-32-characters"
  });
  const database = new MongoDatabase(config.MONGODB_URI, config.MONGODB_DATABASE);
  const auth = createAuthService(config, database);
  const app = createApp({ auth, database, logger: false });

  const response = await app.inject({ method: "GET", url: "/api/auth/ok" });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { ok: true });
  await app.close();
  await database.close();
});

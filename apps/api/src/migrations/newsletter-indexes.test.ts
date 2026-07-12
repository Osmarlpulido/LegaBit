import assert from "node:assert/strict";
import test from "node:test";

import { newsletterMigrations, newsletterValidator } from "./newsletter-indexes.js";

test("defines a stable versioned newsletter migration", () => {
  assert.deepEqual(newsletterMigrations.map(({ id }) => id), ["001-newsletter-subscribers-schema"]);
});

test("validator requires consent evidence and timestamps", () => {
  const schema = newsletterValidator.$jsonSchema as { required: string[]; properties: Record<string, unknown> };
  assert.ok(schema.required.includes("consent"));
  assert.ok(schema.required.includes("consentCapturedAt"));
  assert.ok(schema.required.includes("subscribedAt"));
  assert.ok(schema.properties.consent);
});

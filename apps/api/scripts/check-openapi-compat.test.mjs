import assert from "node:assert/strict";
import test from "node:test";

import { findBreakingChanges } from "./check-openapi-compat.mjs";

const operation = (schema) => ({
  responses: { "200": { content: { "application/json": { schema } }, description: "ok" } }
});
const document = (schema) => ({ openapi: "3.0.3", paths: { "/items": { get: operation(schema) } } });

test("accepts additive response properties, including documented required fields", () => {
  const baseline = document({ type: "object", required: ["id"], properties: { id: { type: "string" } } });
  const candidate = document({ type: "object", required: ["id", "name"], properties: { id: { type: "string" }, name: { type: "string" } } });
  assert.deepEqual(findBreakingChanges(baseline, candidate), []);
});

test("rejects removed operations, properties, and enum values", () => {
  const baseline = document({ type: "object", properties: { state: { type: "string", enum: ["on", "off"] } } });
  const narrowed = document({ type: "object", properties: { state: { type: "string", enum: ["on"] } } });
  assert.match(findBreakingChanges(baseline, narrowed).join("\n"), /enum values removed \(off\)/);
  assert.match(findBreakingChanges(baseline, { ...baseline, paths: {} }).join("\n"), /path was removed/);
});

test("rejects a newly required parameter", () => {
  const baseline = document({ type: "string" });
  const candidate = document({ type: "string" });
  candidate.paths["/items"].get.parameters = [{ name: "currency", in: "query", required: true, schema: { type: "string" } }];
  assert.match(findBreakingChanges(baseline, candidate).join("\n"), /required query parameter 'currency' was added/);
});

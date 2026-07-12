import assert from "node:assert/strict";
import test from "node:test";

import { findBreakingChanges } from "./check-openapi-compat.mjs";

const responseOperation = (schema) => ({ responses: { "200": { content: { "application/json": { schema } }, description: "ok" } } });
const responseDocument = (schema) => ({ openapi: "3.0.3", paths: { "/items": { get: responseOperation(schema) } } });
const requestDocument = (schema) => ({
  openapi: "3.0.3",
  paths: { "/items": { post: { requestBody: { required: true, content: { "application/json": { schema } } }, responses: { "204": { description: "ok" } } } } }
});

test("uses opposite requiredness rules for requests and responses", () => {
  const oldObject = { type: "object", required: ["id"], properties: { id: { type: "string" }, name: { type: "string" } } };
  const newlyRequired = { ...oldObject, required: ["id", "name"] };
  assert.match(findBreakingChanges(requestDocument(oldObject), requestDocument(newlyRequired)).join("\n"), /request property became required/);
  assert.deepEqual(findBreakingChanges(responseDocument(oldObject), responseDocument(newlyRequired)), []);
  assert.match(findBreakingChanges(responseDocument(newlyRequired), responseDocument(oldObject)).join("\n"), /response property is no longer required/);
});

test("uses opposite enum rules for requests and responses", () => {
  const wide = { type: "string", enum: ["on", "off"] };
  const narrow = { type: "string", enum: ["on"] };
  assert.match(findBreakingChanges(requestDocument(wide), requestDocument(narrow)).join("\n"), /request enum became incompatible \(off\)/);
  assert.deepEqual(findBreakingChanges(requestDocument(narrow), requestDocument(wide)), []);
  assert.deepEqual(findBreakingChanges(responseDocument(wide), responseDocument(narrow)), []);
  assert.match(findBreakingChanges(responseDocument(narrow), responseDocument(wide)).join("\n"), /response enum became incompatible \(off\)/);
});

test("checks string, numeric, array, and object bounds directionally", () => {
  for (const [keyword, oldValue, restrictiveValue, expansiveValue] of [
    ["minLength", 2, 3, 1], ["maxLength", 8, 7, 9],
    ["minimum", 2, 3, 1], ["maximum", 8, 7, 9],
    ["minItems", 2, 3, 1], ["maxItems", 8, 7, 9],
    ["minProperties", 2, 3, 1], ["maxProperties", 8, 7, 9]
  ]) {
    const oldSchema = { type: keyword.includes("Items") ? "array" : keyword.includes("Properties") ? "object" : "string", [keyword]: oldValue };
    const restrictive = { ...oldSchema, [keyword]: restrictiveValue };
    const expansive = { ...oldSchema, [keyword]: expansiveValue };
    assert.notDeepEqual(findBreakingChanges(requestDocument(oldSchema), requestDocument(restrictive)), [], `request ${keyword}`);
    assert.notDeepEqual(findBreakingChanges(responseDocument(oldSchema), responseDocument(expansive)), [], `response ${keyword}`);
    assert.deepEqual(findBreakingChanges(requestDocument(oldSchema), requestDocument(expansive)), [], `safe request ${keyword}`);
    assert.deepEqual(findBreakingChanges(responseDocument(oldSchema), responseDocument(restrictive)), [], `safe response ${keyword}`);
  }
});

test("checks pattern, format, and multipleOf constraints directionally", () => {
  for (const [keyword, value] of [["pattern", "^[a-z]+$"], ["format", "email"], ["multipleOf", 2]]) {
    const unconstrained = { type: keyword === "multipleOf" ? "number" : "string" };
    const constrained = { ...unconstrained, [keyword]: value };
    assert.notDeepEqual(findBreakingChanges(requestDocument(unconstrained), requestDocument(constrained)), []);
    assert.notDeepEqual(findBreakingChanges(responseDocument(constrained), responseDocument(unconstrained)), []);
    assert.deepEqual(findBreakingChanges(requestDocument(constrained), requestDocument(unconstrained)), []);
    assert.deepEqual(findBreakingChanges(responseDocument(unconstrained), responseDocument(constrained)), []);
  }
});

test("checks nullable and type unions directionally", () => {
  const nullable = { type: ["string", "null"] };
  const stringOnly = { type: "string" };
  assert.notDeepEqual(findBreakingChanges(requestDocument(nullable), requestDocument(stringOnly)), []);
  assert.deepEqual(findBreakingChanges(requestDocument(stringOnly), requestDocument(nullable)), []);
  assert.deepEqual(findBreakingChanges(responseDocument(nullable), responseDocument(stringOnly)), []);
  assert.notDeepEqual(findBreakingChanges(responseDocument(stringOnly), responseDocument(nullable)), []);
  assert.notDeepEqual(findBreakingChanges(requestDocument({ type: "string", nullable: true }), requestDocument(stringOnly)), []);
});

test("checks additionalProperties directionally", () => {
  const open = { type: "object", properties: {} };
  const closed = { ...open, additionalProperties: false };
  assert.notDeepEqual(findBreakingChanges(requestDocument(open), requestDocument(closed)), []);
  assert.deepEqual(findBreakingChanges(requestDocument(closed), requestDocument(open)), []);
  assert.deepEqual(findBreakingChanges(responseDocument(open), responseDocument(closed)), []);
  assert.notDeepEqual(findBreakingChanges(responseDocument(closed), responseDocument(open)), []);
});

test("checks oneOf alternatives directionally", () => {
  const one = { oneOf: [{ type: "string" }] };
  const two = { oneOf: [{ type: "string" }, { type: "number" }] };
  assert.notDeepEqual(findBreakingChanges(requestDocument(two), requestDocument(one)), []);
  assert.deepEqual(findBreakingChanges(requestDocument(one), requestDocument(two)), []);
  assert.deepEqual(findBreakingChanges(responseDocument(two), responseDocument(one)), []);
  assert.notDeepEqual(findBreakingChanges(responseDocument(one), responseDocument(two)), []);
});

test("checks allOf conjuncts directionally", () => {
  const one = { allOf: [{ type: "string" }] };
  const two = { allOf: [{ type: "string" }, { type: "string", maxLength: 8 }] };
  assert.notDeepEqual(findBreakingChanges(requestDocument(one), requestDocument(two)), []);
  assert.deepEqual(findBreakingChanges(requestDocument(two), requestDocument(one)), []);
  assert.deepEqual(findBreakingChanges(responseDocument(one), responseDocument(two)), []);
  assert.notDeepEqual(findBreakingChanges(responseDocument(two), responseDocument(one)), []);
});

test("rejects removed paths and newly required parameters", () => {
  const baseline = responseDocument({ type: "string" });
  assert.match(findBreakingChanges(baseline, { ...baseline, paths: {} }).join("\n"), /path was removed/);
  const candidate = structuredClone(baseline);
  candidate.paths["/items"].get.parameters = [{ name: "currency", in: "query", required: true, schema: { type: "string" } }];
  assert.match(findBreakingChanges(baseline, candidate).join("\n"), /required query parameter 'currency' was added/);
});

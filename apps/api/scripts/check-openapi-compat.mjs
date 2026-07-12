import { readFile } from "node:fs/promises";
import { execFileSync, spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const HTTP_METHODS = new Set(["get", "put", "post", "delete", "options", "head", "patch", "trace"]);
const MINIMUMS = ["minimum", "minLength", "minItems", "minProperties"];
const MAXIMUMS = ["maximum", "maxLength", "maxItems", "maxProperties"];

function resolveRef(document, value) {
  if (!value || typeof value !== "object" || !("$ref" in value)) return value;
  if (!value.$ref.startsWith("#/")) return value;
  return value.$ref.slice(2).split("/").reduce((node, segment) => node?.[segment.replaceAll("~1", "/").replaceAll("~0", "~")], document);
}

function typeSet(schema) {
  const declared = Array.isArray(schema?.type) ? schema.type : schema?.type ? [schema.type] : schema?.properties ? ["object"] : [];
  const result = new Set(declared);
  if (schema?.nullable) result.add("null");
  return result;
}

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function valuesMissing(required, available) {
  return required.filter((value) => !available.some((candidate) => sameValue(value, candidate)));
}

function compareBound(oldSchema, newSchema, keyword, location, failures, direction, kind) {
  const oldValue = oldSchema[keyword];
  const newValue = newSchema[keyword];
  if (direction === "request") {
    if (newValue !== undefined && (oldValue === undefined || (kind === "min" ? newValue > oldValue : newValue < oldValue))) {
      failures.push(`${location}: request ${keyword} became more restrictive`);
    }
  } else if (oldValue !== undefined && (newValue === undefined || (kind === "min" ? newValue < oldValue : newValue > oldValue))) {
    failures.push(`${location}: response ${keyword} became less restrictive`);
  }
}

function compareExactConstraint(oldSchema, newSchema, keyword, location, failures, direction) {
  const oldValue = oldSchema[keyword];
  const newValue = newSchema[keyword];
  if (direction === "request" && newValue !== undefined && !sameValue(oldValue, newValue)) {
    failures.push(`${location}: request ${keyword} was added or changed`);
  } else if (direction === "response" && oldValue !== undefined && !sameValue(oldValue, newValue)) {
    failures.push(`${location}: response ${keyword} was removed or changed`);
  }
}

function compareComposition(oldDocument, newDocument, oldSchema, newSchema, keyword, location, failures, direction, visited) {
  const oldBranches = oldSchema[keyword];
  const newBranches = newSchema[keyword];
  if (!oldBranches && !newBranches) return;
  if (!oldBranches || !newBranches) {
    failures.push(`${location}: ${direction} ${keyword} was ${oldBranches ? "removed" : "added"}; compatibility cannot be guaranteed`);
    return;
  }
  // Requests must continue accepting every old branch; responses must remain in an old branch.
  const source = direction === "request" ? oldBranches : newBranches;
  const targets = direction === "request" ? newBranches : oldBranches;
  for (const [index, branch] of source.entries()) {
    const compatible = targets.some((target, targetIndex) => {
      const branchFailures = [];
      compareSchema(oldDocument, newDocument,
        direction === "request" ? branch : target,
        direction === "request" ? target : branch,
        `${location}.${keyword}[${index}->${targetIndex}]`, branchFailures, direction, new Set(visited));
      return branchFailures.length === 0;
    });
    if (!compatible) failures.push(`${location}: ${keyword} branch ${index} is incompatible for ${direction}s`);
  }
}

function compareAllOf(oldDocument, newDocument, oldSchema, newSchema, location, failures, direction, visited) {
  const oldBranches = oldSchema.allOf;
  const newBranches = newSchema.allOf;
  if (!oldBranches && !newBranches) return;
  if (!oldBranches || !newBranches) {
    failures.push(`${location}: ${direction} allOf was ${oldBranches ? "removed" : "added"}; compatibility cannot be guaranteed`);
    return;
  }
  // allOf is an intersection: adding a request conjunct or removing a response conjunct is unsafe.
  const source = direction === "request" ? newBranches : oldBranches;
  const targets = direction === "request" ? oldBranches : newBranches;
  for (const [index, branch] of source.entries()) {
    const compatible = targets.some((target, targetIndex) => {
      const branchFailures = [];
      compareSchema(oldDocument, newDocument,
        direction === "request" ? target : branch,
        direction === "request" ? branch : target,
        `${location}.allOf[${index}->${targetIndex}]`, branchFailures, direction, new Set(visited));
      return branchFailures.length === 0;
    });
    if (!compatible) failures.push(`${location}: allOf branch ${index} is incompatible for ${direction}s`);
  }
}

function compareSchema(oldDocument, newDocument, oldValue, newValue, location, failures, direction = "request", visited = new Set()) {
  const oldSchema = resolveRef(oldDocument, oldValue);
  const newSchema = resolveRef(newDocument, newValue);
  if (!oldSchema || !newSchema) {
    if (oldSchema && !newSchema) failures.push(`${location}: schema was removed`);
    return;
  }

  const pair = `${direction}|${oldValue?.$ref ?? location}|${newValue?.$ref ?? location}`;
  if (visited.has(pair)) return;
  visited.add(pair);

  const oldTypes = typeSet(oldSchema);
  const newTypes = typeSet(newSchema);
  const requiredTypes = direction === "request" ? oldTypes : newTypes;
  const availableTypes = direction === "request" ? newTypes : oldTypes;
  const missingTypes = [...requiredTypes].filter((type) => !availableTypes.has(type));
  if (missingTypes.length) failures.push(`${location}: ${direction} no longer supports type(s) ${missingTypes.join(", ")}`);

  if (Array.isArray(oldSchema.enum) && Array.isArray(newSchema.enum)) {
    const missing = direction === "request"
      ? valuesMissing(oldSchema.enum, newSchema.enum)
      : valuesMissing(newSchema.enum, oldSchema.enum);
    if (missing.length) failures.push(`${location}: ${direction} enum became incompatible (${missing.map(String).join(", ")})`);
  } else if (direction === "request" && !oldSchema.enum && newSchema.enum) {
    failures.push(`${location}: request enum constraint was added`);
  } else if (direction === "response" && oldSchema.enum && !newSchema.enum) {
    failures.push(`${location}: response enum constraint was removed`);
  }

  for (const keyword of MINIMUMS) compareBound(oldSchema, newSchema, keyword, location, failures, direction, "min");
  for (const keyword of MAXIMUMS) compareBound(oldSchema, newSchema, keyword, location, failures, direction, "max");
  for (const keyword of ["pattern", "format", "multipleOf"]) compareExactConstraint(oldSchema, newSchema, keyword, location, failures, direction);

  const oldAdditional = oldSchema.additionalProperties ?? true;
  const newAdditional = newSchema.additionalProperties ?? true;
  if (direction === "request" && oldAdditional !== false && newAdditional === false) failures.push(`${location}: request additionalProperties became false`);
  if (direction === "response" && oldAdditional === false && newAdditional !== false) failures.push(`${location}: response additionalProperties became allowed`);
  if (typeof oldAdditional === "object" && typeof newAdditional === "object") {
    compareSchema(oldDocument, newDocument, oldAdditional, newAdditional, `${location}.*`, failures, direction, visited);
  }

  const oldRequired = new Set(oldSchema.required ?? []);
  const newRequired = new Set(newSchema.required ?? []);
  const incompatibleRequired = direction === "request"
    ? [...newRequired].filter((name) => !oldRequired.has(name))
    : [...oldRequired].filter((name) => !newRequired.has(name));
  for (const name of incompatibleRequired) failures.push(`${location}.${name}: ${direction} property ${direction === "request" ? "became" : "is no longer"} required`);

  for (const [name, property] of Object.entries(oldSchema.properties ?? {})) {
    if (!(name in (newSchema.properties ?? {}))) failures.push(`${location}.${name}: property was removed`);
    else compareSchema(oldDocument, newDocument, property, newSchema.properties[name], `${location}.${name}`, failures, direction, visited);
  }

  if (oldSchema.items) compareSchema(oldDocument, newDocument, oldSchema.items, newSchema.items, `${location}[]`, failures, direction, visited);
  for (const keyword of ["oneOf", "anyOf"]) compareComposition(oldDocument, newDocument, oldSchema, newSchema, keyword, location, failures, direction, visited);
  compareAllOf(oldDocument, newDocument, oldSchema, newSchema, location, failures, direction, visited);
}

function parameters(document, pathItem, operation) {
  return [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])].map((parameter) => resolveRef(document, parameter));
}

export function findBreakingChanges(baseline, candidate) {
  const failures = [];
  for (const [path, oldPathItemValue] of Object.entries(baseline.paths ?? {})) {
    const oldPathItem = resolveRef(baseline, oldPathItemValue);
    const newPathItem = resolveRef(candidate, candidate.paths?.[path]);
    if (!newPathItem) { failures.push(`${path}: path was removed`); continue; }
    for (const [method, oldOperation] of Object.entries(oldPathItem)) {
      if (!HTTP_METHODS.has(method)) continue;
      const newOperation = newPathItem[method];
      const location = `${method.toUpperCase()} ${path}`;
      if (!newOperation) { failures.push(`${location}: operation was removed`); continue; }
      const oldParameters = parameters(baseline, oldPathItem, oldOperation);
      const newParameters = parameters(candidate, newPathItem, newOperation);
      for (const oldParameter of oldParameters) {
        const replacement = newParameters.find((parameter) => parameter.name === oldParameter.name && parameter.in === oldParameter.in);
        if (!replacement) failures.push(`${location}: ${oldParameter.in} parameter '${oldParameter.name}' was removed`);
        else {
          if (!oldParameter.required && replacement.required) failures.push(`${location}: parameter '${oldParameter.name}' became required`);
          compareSchema(baseline, candidate, oldParameter.schema, replacement.schema, `${location} parameter '${oldParameter.name}'`, failures);
        }
      }
      for (const parameter of newParameters) if (parameter.required && !oldParameters.some((old) => old.name === parameter.name && old.in === parameter.in)) failures.push(`${location}: required ${parameter.in} parameter '${parameter.name}' was added`);
      const oldBody = resolveRef(baseline, oldOperation.requestBody);
      const newBody = resolveRef(candidate, newOperation.requestBody);
      if (!oldBody && newBody?.required) failures.push(`${location}: required request body was added`);
      if (oldBody && !oldBody.required && newBody?.required) failures.push(`${location}: request body became required`);
      for (const [mediaType, oldMedia] of Object.entries(oldBody?.content ?? {})) {
        const newMedia = newBody?.content?.[mediaType];
        if (!newMedia) failures.push(`${location}: request content type '${mediaType}' was removed`);
        else compareSchema(baseline, candidate, oldMedia.schema, newMedia.schema, `${location} request ${mediaType}`, failures);
      }
      for (const [status, oldResponseValue] of Object.entries(oldOperation.responses ?? {})) {
        const newResponseValue = newOperation.responses?.[status];
        if (!newResponseValue) { failures.push(`${location}: response ${status} was removed`); continue; }
        const oldResponse = resolveRef(baseline, oldResponseValue);
        const newResponse = resolveRef(candidate, newResponseValue);
        for (const [mediaType, oldMedia] of Object.entries(oldResponse?.content ?? {})) {
          const newMedia = newResponse?.content?.[mediaType];
          if (!newMedia) failures.push(`${location}: response ${status} content type '${mediaType}' was removed`);
          else compareSchema(baseline, candidate, oldMedia.schema, newMedia.schema, `${location} response ${status} ${mediaType}`, failures, "response");
        }
      }
    }
  }
  return failures;
}

function argument(name) { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; }
async function loadJson(path) { return JSON.parse(await readFile(path, "utf8")); }
function loadGitBaseline(baseRef) {
  const revision = spawnSync("git", ["rev-parse", "--verify", `${baseRef}^{commit}`], { encoding: "utf8" });
  if (revision.status !== 0) throw new Error(`Invalid OpenAPI base Git ref: ${baseRef}`);

  const artifact = `${baseRef}:apps/api/openapi/openapi.json`;
  const exists = spawnSync("git", ["cat-file", "-e", artifact], { encoding: "utf8" });
  if (exists.status !== 0) return undefined;
  return JSON.parse(execFileSync("git", ["show", artifact], { encoding: "utf8" }));
}
async function main() {
  const candidatePath = argument("--candidate") ?? new URL("../openapi/openapi.json", import.meta.url);
  const baselinePath = argument("--baseline");
  const baseRef = argument("--base-ref");
  if (!baselinePath && !baseRef) throw new Error("Provide --baseline <file> or --base-ref <git-ref>.");
  const candidate = await loadJson(candidatePath);
  const baseline = baselinePath ? await loadJson(baselinePath) : loadGitBaseline(baseRef);
  if (!baseline) {
    console.log("No OpenAPI artifact exists at the base ref; treating this as the initial compatibility baseline.");
    return;
  }
  const failures = findBreakingChanges(baseline, candidate);
  if (failures.length) throw new Error(`Breaking OpenAPI changes detected:\n- ${failures.join("\n- ")}`);
  console.log("OpenAPI compatibility check passed.");
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();

import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const HTTP_METHODS = new Set(["get", "put", "post", "delete", "options", "head", "patch", "trace"]);

function resolveRef(document, value) {
  if (!value || typeof value !== "object" || !("$ref" in value)) return value;
  const prefix = "#/";
  if (!value.$ref.startsWith(prefix)) return value;
  return value.$ref.slice(prefix.length).split("/").reduce((node, segment) => node?.[segment.replaceAll("~1", "/").replaceAll("~0", "~")], document);
}

function schemaType(schema) {
  if (schema?.type) return Array.isArray(schema.type) ? schema.type.join("|") : schema.type;
  if (schema?.properties) return "object";
  return undefined;
}

function compareSchema(oldDocument, newDocument, oldValue, newValue, location, failures, direction = "request", visited = new Set()) {
  const oldSchema = resolveRef(oldDocument, oldValue);
  const newSchema = resolveRef(newDocument, newValue);
  if (!oldSchema || !newSchema) {
    if (oldSchema && !newSchema) failures.push(`${location}: schema was removed`);
    return;
  }

  const pair = `${oldValue?.$ref ?? location}|${newValue?.$ref ?? location}`;
  if (visited.has(pair)) return;
  visited.add(pair);

  const oldType = schemaType(oldSchema);
  const newType = schemaType(newSchema);
  if (oldType && newType && oldType !== newType) failures.push(`${location}: type changed from ${oldType} to ${newType}`);

  if (Array.isArray(oldSchema.enum) && Array.isArray(newSchema.enum)) {
    const removed = oldSchema.enum.filter((value) => !newSchema.enum.some((candidate) => JSON.stringify(candidate) === JSON.stringify(value)));
    if (removed.length) failures.push(`${location}: enum values removed (${removed.map(String).join(", ")})`);
  }

  const oldRequired = new Set(oldSchema.required ?? []);
  const newRequired = new Set(newSchema.required ?? []);
  for (const name of newRequired) {
    if (direction === "request" && !oldRequired.has(name)) failures.push(`${location}.${name}: request property became required`);
  }

  for (const [name, property] of Object.entries(oldSchema.properties ?? {})) {
    if (!(name in (newSchema.properties ?? {}))) failures.push(`${location}.${name}: property was removed`);
    else compareSchema(oldDocument, newDocument, property, newSchema.properties[name], `${location}.${name}`, failures, direction, visited);
  }

  if (oldSchema.items) compareSchema(oldDocument, newDocument, oldSchema.items, newSchema.items, `${location}[]`, failures, direction, visited);
}

function parameters(document, pathItem, operation) {
  return [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])].map((parameter) => resolveRef(document, parameter));
}

export function findBreakingChanges(baseline, candidate) {
  const failures = [];
  for (const [path, oldPathItemValue] of Object.entries(baseline.paths ?? {})) {
    const oldPathItem = resolveRef(baseline, oldPathItemValue);
    const newPathItem = resolveRef(candidate, candidate.paths?.[path]);
    if (!newPathItem) {
      failures.push(`${path}: path was removed`);
      continue;
    }
    for (const [method, oldOperation] of Object.entries(oldPathItem)) {
      if (!HTTP_METHODS.has(method)) continue;
      const newOperation = newPathItem[method];
      const location = `${method.toUpperCase()} ${path}`;
      if (!newOperation) {
        failures.push(`${location}: operation was removed`);
        continue;
      }

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
      for (const parameter of newParameters) {
        if (parameter.required && !oldParameters.some((old) => old.name === parameter.name && old.in === parameter.in)) {
          failures.push(`${location}: required ${parameter.in} parameter '${parameter.name}' was added`);
        }
      }

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
        if (!newResponseValue) {
          failures.push(`${location}: response ${status} was removed`);
          continue;
        }
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

function argument(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
}

async function loadJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function main() {
  const candidatePath = argument("--candidate") ?? new URL("../openapi/openapi.json", import.meta.url);
  const baselinePath = argument("--baseline");
  const baseRef = argument("--base-ref");
  if (!baselinePath && !baseRef) throw new Error("Provide --baseline <file> or --base-ref <git-ref>.");
  const candidate = await loadJson(candidatePath);
  const baseline = baselinePath
    ? await loadJson(baselinePath)
    : JSON.parse(execFileSync("git", ["show", `${baseRef}:apps/api/openapi/openapi.json`], { encoding: "utf8" }));
  const failures = findBreakingChanges(baseline, candidate);
  if (failures.length) throw new Error(`Breaking OpenAPI changes detected:\n- ${failures.join("\n- ")}`);
  console.log("OpenAPI compatibility check passed.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import type { OpenAPIV3 } from "openapi-types";

import { createApp } from "./http/app.js";

const outputUrl = new URL("../openapi/openapi.json", import.meta.url);

async function generateDocument(): Promise<string> {
  const app = createApp({
    auth: {
      handler: async () => new Response(null, { status: 404 }),
      getSession: async () => null
    },
    database: { check: async () => undefined },
    logger: false
  });

  await app.ready();
  const document = app.swagger() as OpenAPIV3.Document;
  await app.close();
  return `${JSON.stringify(document, null, 2)}\n`;
}

async function main(): Promise<void> {
  const document = await generateDocument();
  const check = process.argv.includes("--check");

  if (!check) {
    await writeFile(outputUrl, document, "utf8");
    return;
  }

  let committed: string;
  try {
    committed = await readFile(outputUrl, "utf8");
  } catch {
    throw new Error(`OpenAPI artifact is missing at ${fileURLToPath(outputUrl)}. Run yarn openapi:generate.`);
  }

  if (committed !== document) {
    throw new Error("OpenAPI artifact is stale. Run yarn openapi:generate and commit the result.");
  }
}

await main();

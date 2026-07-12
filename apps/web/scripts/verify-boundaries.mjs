import assert from "node:assert/strict";
import { ESLint } from "eslint";

const eslint = new ESLint({ cwd: new URL("..", import.meta.url).pathname });

const rejected = [
  'import { prisma } from "../../../../packages/db/src";',
  'import api from "../../../apps/api/src/http/app";',
  'const db = await import("../../../../packages/db/src");',
  'const secret = process.env.DATABASE_URL;',
  'const secret = process.env["DATABASE_URL"];',
  'const secret = process.env[key];',
  'const secret = process["env"][key];',
  'const { DATABASE_URL } = process.env;',
  'const environment = process.env;',
  'Reflect.get(process.env, key);',
  'const copy = { ...process.env };'
];

for (const code of rejected) {
  const [result] = await eslint.lintText(code, { filePath: "src/boundary-negative-fixture.ts" });
  assert.ok(result.errorCount > 0, `Expected boundary violation for: ${code}`);
}

const [publicResult] = await eslint.lintText(
  'const publicUrl = process.env.NEXT_PUBLIC_API_BASE_URL;',
  { filePath: "src/boundary-public-fixture.ts" }
);
assert.equal(publicResult.errorCount, 0, publicResult.messages.map(({ message }) => message).join("\n"));

console.log("Frontend dependency and environment boundary checks passed.");

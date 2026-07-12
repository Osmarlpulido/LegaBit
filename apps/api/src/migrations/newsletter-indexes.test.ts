import assert from "node:assert/strict";
import test from "node:test";

import { migrateNewsletterIndexes } from "./newsletter-indexes.js";

test("creates the newsletter email index with a stable unique definition", async () => {
  const calls: unknown[][] = [];
  const collection = {
    createIndex: async (...args: unknown[]) => {
      calls.push(args);
      return "newsletter_email_unique";
    }
  };

  await migrateNewsletterIndexes(collection as never);

  assert.deepEqual(calls, [[
    { email: 1 },
    { name: "newsletter_email_unique", unique: true }
  ]]);
});

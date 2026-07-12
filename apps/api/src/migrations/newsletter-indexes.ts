import type { Collection } from "mongodb";

import { loadConfig } from "../bootstrap/config.js";
import { MongoDatabase } from "../infrastructure/mongodb.js";

type IndexCollection = Pick<Collection, "createIndex">;

export async function migrateNewsletterIndexes(collection: IndexCollection): Promise<void> {
  await collection.createIndex(
    { email: 1 },
    { name: "newsletter_email_unique", unique: true }
  );
}

async function main(): Promise<void> {
  const config = loadConfig();
  const database = new MongoDatabase(config.MONGODB_URI, config.MONGODB_DATABASE);

  try {
    await database.connect();
    await migrateNewsletterIndexes(database.database.collection("newsletterSubscribers"));
    process.stdout.write("Newsletter indexes are ready.\n");
  } finally {
    await database.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: unknown) => {
    process.stderr.write(`Newsletter index migration failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}

import { MongoClient, type Db, type Document } from "mongodb";

const SUBSCRIBERS = "newsletterSubscribers";
const HISTORY = "schemaMigrations";

export const newsletterValidator: Document = {
  $jsonSchema: {
    bsonType: "object",
    additionalProperties: false,
    required: ["_id", "email", "phone", "source", "consent", "consentCapturedAt", "subscribedAt"],
    properties: {
      _id: { bsonType: "objectId" },
      email: { bsonType: "string", maxLength: 320 },
      displayName: { bsonType: "string", minLength: 1, maxLength: 120 },
      phone: { bsonType: "string", minLength: 7, maxLength: 32 },
      source: { bsonType: "string", maxLength: 64 },
      consent: {
        bsonType: "object",
        additionalProperties: false,
        required: ["accepted", "policyVersion"],
        properties: {
          accepted: { enum: [true] },
          policyVersion: { enum: ["privacy-v1"] }
        }
      },
      consentCapturedAt: { bsonType: "date" },
      subscribedAt: { bsonType: "date" }
    }
  }
};

type Migration = {
  id: string;
  migrate(database: Db): Promise<void>;
};

export const newsletterMigrations: readonly Migration[] = [{
  id: "001-newsletter-subscribers-schema",
  async migrate(database) {
    const exists = await database.listCollections({ name: SUBSCRIBERS }, { nameOnly: true }).hasNext();
    if (exists) {
      await database.command({ collMod: SUBSCRIBERS, validator: newsletterValidator, validationLevel: "strict", validationAction: "error" });
    } else {
      await database.createCollection(SUBSCRIBERS, {
        validator: newsletterValidator,
        validationLevel: "strict",
        validationAction: "error"
      });
    }
    await database.collection(SUBSCRIBERS).createIndex(
      { email: 1 },
      { name: "newsletter_email_unique", unique: true }
    );
  }
}];

export async function runNewsletterMigrations(database: Db): Promise<string[]> {
  const history = database.collection<{ id: string; appliedAt: Date }>(HISTORY);
  await history.createIndex({ id: 1 }, { name: "schema_migration_id_unique", unique: true });
  const applied: string[] = [];

  for (const migration of newsletterMigrations) {
    if (await history.findOne({ id: migration.id })) continue;
    await migration.migrate(database);
    await history.updateOne(
      { id: migration.id },
      { $setOnInsert: { id: migration.id, appliedAt: new Date() } },
      { upsert: true }
    );
    applied.push(migration.id);
  }
  return applied;
}

async function main(): Promise<void> {
  const uri = process.env.MONGODB_MIGRATION_URI;
  if (!uri) throw new Error("MONGODB_MIGRATION_URI is required (runtime MONGODB_URI is intentionally not used)");
  const databaseName = process.env.MONGODB_DATABASE || "legabit";
  const client = new MongoClient(uri, { appName: "legabit-migrations", serverSelectionTimeoutMS: 5_000 });
  try {
    await client.connect();
    const applied = await runNewsletterMigrations(client.db(databaseName));
    process.stdout.write(applied.length ? `Applied migrations: ${applied.join(", ")}\n` : "Newsletter schema is up to date.\n");
  } finally {
    await client.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: unknown) => {
    process.stderr.write(`Newsletter migration failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}

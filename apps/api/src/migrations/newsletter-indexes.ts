import { randomUUID } from "node:crypto";

import { MongoClient, type Db, type Document } from "mongodb";

const SUBSCRIBERS = "newsletterSubscribers";
const HISTORY = "schemaMigrations";

// Keep the schema owned by each migration immutable. Changes to the current
// validator belong in a new migration, never in an already released one.
const newsletterValidatorV1: Document = {
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

export const newsletterValidator: Document = {
  $jsonSchema: {
    bsonType: "object",
    additionalProperties: false,
    required: ["_id", "email", "phone", "source", "consent", "consentCapturedAt", "subscribedAt"],
    properties: {
      _id: { bsonType: "objectId" },
      email: { bsonType: "string", minLength: 3, maxLength: 320 },
      displayName: { bsonType: "string", minLength: 1, maxLength: 120 },
      phone: { bsonType: "string", minLength: 7, maxLength: 32 },
      source: { bsonType: "string", minLength: 1, maxLength: 64 },
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

export type Migration = {
  id: string;
  migrate(database: Db): Promise<void>;
};

export const newsletterMigrations: readonly Migration[] = [
  {
    id: "001-newsletter-subscribers-schema",
    async migrate(database) {
      const exists = await database.listCollections({ name: SUBSCRIBERS }, { nameOnly: true }).hasNext();
      if (exists) {
        await database.command({
          collMod: SUBSCRIBERS,
          validator: newsletterValidatorV1,
          validationLevel: "strict",
          validationAction: "error"
        });
      } else {
        await database.createCollection(SUBSCRIBERS, {
          validator: newsletterValidatorV1,
          validationLevel: "strict",
          validationAction: "error"
        });
      }
      await database.collection(SUBSCRIBERS).createIndex(
        { email: 1 },
        { name: "newsletter_email_unique", unique: true }
      );
    }
  },
  {
    id: "002-newsletter-subscribers-strict-validator",
    async migrate(database) {
      await database.command({
        collMod: SUBSCRIBERS,
        validator: newsletterValidator,
        validationLevel: "strict",
        validationAction: "error"
      });
    }
  }
];

type MigrationHistory = {
  id: string;
  status?: "running" | "applied" | "failed";
  ownerToken?: string;
  leaseUntil?: Date;
  startedAt?: Date;
  appliedAt?: Date;
  failedAt?: Date;
  error?: string;
};

type MigrationOptions = {
  leaseDurationMs?: number;
  pollIntervalMs?: number;
  ownerToken?: string;
  migrations?: readonly Migration[];
};

const isDuplicateKey = (error: unknown): boolean =>
  typeof error === "object" && error !== null && "code" in error && error.code === 11000;

const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function runNewsletterMigrations(database: Db, options: MigrationOptions = {}): Promise<string[]> {
  const history = database.collection<MigrationHistory>(HISTORY);
  const leaseDurationMs = options.leaseDurationMs ?? 60_000;
  const pollIntervalMs = options.pollIntervalMs ?? 100;
  const ownerToken = options.ownerToken ?? randomUUID();
  const migrations = options.migrations ?? newsletterMigrations;
  await history.createIndex({ id: 1 }, { name: "schema_migration_id_unique", unique: true });
  // Records written by the original runner had appliedAt but no status.
  await history.updateMany(
    { status: { $exists: false }, appliedAt: { $exists: true } },
    { $set: { status: "applied" } }
  );
  const applied: string[] = [];

  for (const migration of migrations) {
    let claimed = false;
    while (!claimed) {
      const now = new Date();
      const leaseUntil = new Date(now.getTime() + leaseDurationMs);
      try {
        const result = await history.findOneAndUpdate(
          {
            id: migration.id,
            $or: [
              { status: "failed" },
              { status: "running", leaseUntil: { $lte: now } }
            ]
          },
          {
            $set: { status: "running", ownerToken, leaseUntil, startedAt: now },
            $unset: { failedAt: "", error: "", appliedAt: "" },
            $setOnInsert: { id: migration.id }
          },
          { upsert: true, returnDocument: "after" }
        );
        claimed = result?.ownerToken === ownerToken;
      } catch (error) {
        if (!isDuplicateKey(error)) throw error;
      }

      if (!claimed) {
        const current = await history.findOne({ id: migration.id });
        if (current?.status === "applied" || (current?.appliedAt && !current.status)) break;
        await sleep(pollIntervalMs);
      }
    }

    if (!claimed) continue;

    const heartbeat = setInterval(() => {
      void history.updateOne(
        { id: migration.id, status: "running", ownerToken },
        { $set: { leaseUntil: new Date(Date.now() + leaseDurationMs) } }
      );
    }, Math.max(10, Math.floor(leaseDurationMs / 3)));
    heartbeat.unref();

    try {
      await migration.migrate(database);
      const completion = await history.updateOne(
        { id: migration.id, status: "running", ownerToken },
        {
          $set: { status: "applied", appliedAt: new Date() },
          $unset: { ownerToken: "", leaseUntil: "", failedAt: "", error: "" }
        }
      );
      if (completion.modifiedCount !== 1) throw new Error(`Lost migration lease for ${migration.id}`);
      applied.push(migration.id);
    } catch (error) {
      await history.updateOne(
        { id: migration.id, status: "running", ownerToken },
        {
          $set: {
            status: "failed",
            failedAt: new Date(),
            error: error instanceof Error ? error.message : String(error)
          },
          $unset: { ownerToken: "", leaseUntil: "" }
        }
      );
      throw error;
    } finally {
      clearInterval(heartbeat);
    }
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

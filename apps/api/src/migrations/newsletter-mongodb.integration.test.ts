import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";

import { MongoClient } from "mongodb";

import { MongoNewsletterRepository } from "../infrastructure/newsletter-repository.js";
import type { NewsletterSubscription } from "../modules/newsletter/newsletter.js";
import { runNewsletterMigrations } from "./newsletter-indexes.js";

const integrationUri = process.env.MONGODB_INTEGRATION_URI;

test("newsletter migrations and repository work against MongoDB", {
  skip: integrationUri ? false : "MONGODB_INTEGRATION_URI is not configured"
}, async () => {
  const client = new MongoClient(integrationUri!);
  const database = client.db(`legabit_test_${randomUUID().replaceAll("-", "")}`);
  try {
    await client.connect();
    assert.deepEqual(await runNewsletterMigrations(database), [
      "001-newsletter-subscribers-schema",
      "002-newsletter-subscribers-strict-validator"
    ]);
    assert.deepEqual(await runNewsletterMigrations(database), []);

    const repository = new MongoNewsletterRepository(database);
    const subscription: NewsletterSubscription = {
      email: "parallel@example.com",
      phone: "+57 300 000 0000",
      source: "integration-test",
      consent: { accepted: true, policyVersion: "privacy-v1" },
      consentCapturedAt: new Date("2026-01-02T03:04:05.000Z"),
      subscribedAt: new Date("2026-01-02T03:04:05.000Z")
    };
    const results = await Promise.all(Array.from({ length: 12 }, () => repository.subscribe(subscription)));
    assert.equal(results.filter(({ alreadySubscribed }) => !alreadySubscribed).length, 1);
    assert.equal(await database.collection("newsletterSubscribers").countDocuments({ email: subscription.email }), 1);

    const persisted = await database.collection("newsletterSubscribers").findOne({ email: subscription.email });
    assert.deepEqual(persisted?.consent, subscription.consent);
    assert.deepEqual(persisted?.consentCapturedAt, subscription.consentCapturedAt);

    const indexes = await database.collection("newsletterSubscribers").indexes();
    assert.ok(indexes.some(({ name, unique }) => name === "newsletter_email_unique" && unique === true));
    await assert.rejects(
      database.collection("newsletterSubscribers").insertOne({ email: "invalid@example.com" }),
      (error: unknown) => typeof error === "object" && error !== null && "code" in error && error.code === 121
    );
    assert.equal(await database.collection("schemaMigrations").countDocuments(), 2);
  } finally {
    await database.dropDatabase().catch(() => undefined);
    await client.close();
  }
});

test("concurrent migration runners claim each migration exactly once", {
  skip: integrationUri ? false : "MONGODB_INTEGRATION_URI is not configured"
}, async () => {
  const client = new MongoClient(integrationUri!);
  const database = client.db(`legabit_migration_race_${randomUUID().replaceAll("-", "")}`);
  try {
    await client.connect();
    const results = await Promise.all(Array.from({ length: 8 }, (_, index) =>
      runNewsletterMigrations(database, { ownerToken: `runner-${index}`, pollIntervalMs: 5 })
    ));
    assert.equal(results.flat().filter((id) => id === "001-newsletter-subscribers-schema").length, 1);
    assert.equal(results.flat().filter((id) => id === "002-newsletter-subscribers-strict-validator").length, 1);
    assert.equal(await database.collection("schemaMigrations").countDocuments({ status: "applied" }), 2);
  } finally {
    await database.dropDatabase().catch(() => undefined);
    await client.close();
  }
});

test("an existing 001 database receives the immutable 002 validator upgrade", {
  skip: integrationUri ? false : "MONGODB_INTEGRATION_URI is not configured"
}, async () => {
  const client = new MongoClient(integrationUri!);
  const database = client.db(`legabit_migration_upgrade_${randomUUID().replaceAll("-", "")}`);
  try {
    await client.connect();
    await database.createCollection("newsletterSubscribers");
    await database.collection("schemaMigrations").insertOne({
      id: "001-newsletter-subscribers-schema",
      appliedAt: new Date("2026-01-01T00:00:00.000Z")
    });
    assert.deepEqual(await runNewsletterMigrations(database), ["002-newsletter-subscribers-strict-validator"]);
    const history = await database.collection("schemaMigrations").find().sort({ id: 1 }).toArray();
    assert.deepEqual(history.map(({ id, status }) => [id, status]), [
      ["001-newsletter-subscribers-schema", "applied"],
      ["002-newsletter-subscribers-strict-validator", "applied"]
    ]);
    await assert.rejects(
      database.collection("newsletterSubscribers").insertOne({ email: "invalid@example.com" }),
      (error: unknown) => typeof error === "object" && error !== null && "code" in error && error.code === 121
    );
  } finally {
    await database.dropDatabase().catch(() => undefined);
    await client.close();
  }
});

test("failed migrations are recorded and can be safely retried", {
  skip: integrationUri ? false : "MONGODB_INTEGRATION_URI is not configured"
}, async () => {
  const client = new MongoClient(integrationUri!);
  const database = client.db(`legabit_migration_retry_${randomUUID().replaceAll("-", "")}`);
  let attempts = 0;
  const retryableMigration = [{
    id: "test-retryable-migration",
    async migrate() {
      attempts += 1;
      if (attempts === 1) throw new Error("simulated schema mutation failure");
    }
  }];
  try {
    await client.connect();
    await assert.rejects(
      runNewsletterMigrations(database, { migrations: retryableMigration, ownerToken: "failed-runner" }),
      /simulated schema mutation failure/
    );
    const failed = await database.collection("schemaMigrations").findOne({ id: "test-retryable-migration" });
    assert.equal(failed?.status, "failed");
    assert.equal(failed?.ownerToken, undefined);
    assert.equal(failed?.error, "simulated schema mutation failure");

    assert.deepEqual(await runNewsletterMigrations(database, {
      migrations: retryableMigration,
      ownerToken: "retry-runner"
    }), ["test-retryable-migration"]);
    assert.equal(attempts, 2);
    assert.equal((await database.collection("schemaMigrations").findOne({ id: "test-retryable-migration" }))?.status, "applied");
  } finally {
    await database.dropDatabase().catch(() => undefined);
    await client.close();
  }
});

test("a runner recovers an expired migration lease", {
  skip: integrationUri ? false : "MONGODB_INTEGRATION_URI is not configured"
}, async () => {
  const client = new MongoClient(integrationUri!);
  const database = client.db(`legabit_migration_stale_${randomUUID().replaceAll("-", "")}`);
  const migration = [{ id: "test-stale-migration", async migrate() {} }];
  try {
    await client.connect();
    await database.collection("schemaMigrations").insertOne({
      id: "test-stale-migration",
      status: "running",
      ownerToken: "dead-runner",
      leaseUntil: new Date(Date.now() - 1_000)
    });
    assert.deepEqual(await runNewsletterMigrations(database, {
      migrations: migration,
      ownerToken: "recovery-runner",
      leaseDurationMs: 100
    }), ["test-stale-migration"]);
    const recovered = await database.collection("schemaMigrations").findOne({ id: "test-stale-migration" });
    assert.equal(recovered?.status, "applied");
    assert.equal(recovered?.ownerToken, undefined);
  } finally {
    await database.dropDatabase().catch(() => undefined);
    await client.close();
  }
});

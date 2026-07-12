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
    assert.deepEqual(await runNewsletterMigrations(database), ["001-newsletter-subscribers-schema"]);
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
    assert.equal(await database.collection("schemaMigrations").countDocuments(), 1);
  } finally {
    await database.dropDatabase().catch(() => undefined);
    await client.close();
  }
});

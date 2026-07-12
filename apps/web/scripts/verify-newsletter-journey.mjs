import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { MongoClient } from "mongodb";
import puppeteer from "puppeteer-core";

const baseUrl = (process.env.JOURNEY_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const mongoUri =
  process.env.JOURNEY_MONGODB_URI ??
  process.env.MONGODB_INTEGRATION_URI ??
  process.env.MONGODB_URI ??
  "mongodb://127.0.0.1:27017/?replicaSet=rs0";
const mongoDatabase = process.env.JOURNEY_MONGODB_DATABASE ?? process.env.MONGODB_DATABASE ?? "legabit";
const email = `journey-${Date.now()}@example.com`;
const displayName = "Journey Test";
const phone = "+57 300 000 0000";

async function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser"
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next standard Chrome/Chromium location.
    }
  }
  throw new Error("Chrome/Chromium not found. Set CHROME_PATH to its executable.");
}

process.stdout.write("Launching browser journey...\n");
const browser = await puppeteer.launch({
  executablePath: await findChrome(),
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"]
});
const mongo = new MongoClient(mongoUri);

try {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", async (request) => {
    if (request.method() === "POST" && request.url().includes("/api/v1/newsletter/subscriptions")) {
      // Keep the real request pending briefly so the loading UI is observable.
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    await request.continue();
  });

  process.stdout.write("Opening newsletter page...\n");
  const response = await page.goto(`${baseUrl}/newsletter`, { waitUntil: "domcontentloaded", timeout: 15_000 });
  assert.equal(response?.status(), 200, "Newsletter page must render successfully");
  await page.waitForSelector('input[name="displayName"]', { visible: true, timeout: 15_000 });
  // Let the App Router hydrate before driving controlled React inputs.
  await new Promise((resolve) => setTimeout(resolve, 1_500));

  await page.type('input[name="displayName"]', displayName);
  await page.type('input[name="email"]', email);
  await page.type('input[name="phone"]', phone);
  await page.click('input[name="consent"]');
  assert.equal(await page.$eval('input[name="consent"]', (element) => element.checked), true);

  process.stdout.write("Submitting actual newsletter form...\n");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => {
    const button = document.querySelector('button[type="submit"]');
    return button?.disabled && button.textContent?.includes("Enviando");
  }, { polling: 10, timeout: 5_000 });

  process.stdout.write("Waiting for success UI...\n");
  await page.waitForFunction(
    () => document.querySelector('[role="status"]')?.textContent?.includes("suscripción"),
    { timeout: 15_000 }
  );
  assert.match(await page.$eval('[role="status"]', (element) => element.textContent ?? ""), /suscripción quedó registrada/);
  assert.equal(await page.$eval('input[name="email"]', (element) => element.value), "");
  assert.equal(await page.$eval('input[name="consent"]', (element) => element.checked), false);

  process.stdout.write("Verifying persisted consent evidence...\n");
  await mongo.connect();
  const subscribers = mongo.db(mongoDatabase).collection("newsletterSubscribers");
  const persisted = await subscribers.findOne({ email });
  assert.ok(persisted, "Browser-submitted newsletter subscription must be persisted");
  assert.equal(persisted.displayName, displayName);
  assert.equal(persisted.phone, phone);
  assert.equal(persisted.source, "newsletter-page");
  assert.deepEqual(persisted.consent, { accepted: true, policyVersion: "privacy-v1" });
  assert.ok(persisted.consentCapturedAt instanceof Date, "Consent capture timestamp must be persisted");
  assert.ok(persisted.subscribedAt instanceof Date, "Subscription timestamp must be persisted");

  await subscribers.deleteOne({ email });
  process.stdout.write(`Newsletter browser journey and persisted consent verification passed for ${email}.\n`);
} finally {
  await Promise.allSettled([browser.close(), mongo.close()]);
}

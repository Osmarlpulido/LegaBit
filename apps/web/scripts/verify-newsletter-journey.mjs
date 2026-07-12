import assert from "node:assert/strict";

const baseUrl = (process.env.JOURNEY_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const email = `journey-${Date.now()}@example.com`;

const page = await fetch(`${baseUrl}/newsletter`);
assert.equal(page.status, 200, "Newsletter page must render successfully");
const html = await page.text();
assert.match(html, /Quiero recibir el newsletter/, "Newsletter form must be rendered");
assert.match(html, /name="consent"/, "Affirmative consent control must be rendered");

const response = await fetch(`${baseUrl}/api/v1/newsletter/subscriptions`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    email,
    displayName: "Journey Test",
    phone: "+57 300 000 0000",
    source: "journey-test",
    consent: { accepted: true, policyVersion: "privacy-v1" }
  })
});
const responseText = await response.text();
assert.equal(response.status, 200, `Newsletter submission failed: ${responseText}`);
const body = JSON.parse(responseText);
assert.deepEqual(body, {
  ok: true,
  alreadySubscribed: false,
  message: "Si el correo es válido, la suscripción quedó registrada."
});

process.stdout.write(`Newsletter same-origin journey passed for ${email}.\n`);

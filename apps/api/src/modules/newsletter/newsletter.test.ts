import assert from "node:assert/strict";
import { it } from "node:test";

import { SubscribeNewsletter } from "./newsletter.js";

const input = {
  email: "person@example.com", displayName: "Person", phone: "+57 300 000 0000", source: "landing",
  consent: { accepted: true as const, policyVersion: "privacy-v1" as const }
};

it("returns a created subscription result", async () => {
  let received: unknown;
  const useCase = new SubscribeNewsletter({
    subscribe: async (subscription) => { received = subscription; return { alreadySubscribed: false }; }
  }, () => new Date("2026-07-12T00:00:00.000Z"));

  assert.deepEqual(await useCase.execute(input), {
    ok: true,
    alreadySubscribed: false,
    message: "Si el correo es válido, la suscripción quedó registrada."
  });
  assert.deepEqual(received, {
    ...input,
    subscribedAt: new Date("2026-07-12T00:00:00.000Z"),
    consentCapturedAt: new Date("2026-07-12T00:00:00.000Z")
  });
});

it("does not reveal an idempotent duplicate", async () => {
  const useCase = new SubscribeNewsletter({ subscribe: async () => ({ alreadySubscribed: true }) });
  const result = await useCase.execute(input);
  assert.deepEqual(result, { ok: true, alreadySubscribed: false, message: "Si el correo es válido, la suscripción quedó registrada." });
});

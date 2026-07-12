import assert from "node:assert/strict";
import { it } from "node:test";

import { SubscribeNewsletter } from "./newsletter.js";

const input = { email: "person@example.com", displayName: "Person", phone: "+57 300 000 0000", source: "landing" };

it("returns a created subscription result", async () => {
  let received: unknown;
  const useCase = new SubscribeNewsletter({
    subscribe: async (subscription) => { received = subscription; return { alreadySubscribed: false }; }
  }, () => new Date("2026-07-12T00:00:00.000Z"));

  assert.deepEqual(await useCase.execute(input), {
    ok: true,
    alreadySubscribed: false,
    message: "Suscripción registrada correctamente."
  });
  assert.deepEqual(received, { ...input, subscribedAt: new Date("2026-07-12T00:00:00.000Z") });
});

it("returns an idempotent duplicate result", async () => {
  const useCase = new SubscribeNewsletter({ subscribe: async () => ({ alreadySubscribed: true }) });
  const result = await useCase.execute(input);
  assert.equal(result.alreadySubscribed, true);
  assert.equal(result.message, "Este correo ya está suscrito.");
});

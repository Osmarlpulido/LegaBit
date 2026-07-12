import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AppError } from "@legabit/api-contracts";

import { GetMarkets } from "../modules/markets/markets.js";
import { createApp } from "./app.js";

const auth = { handler: async () => new Response(null), getSession: async () => null };
const data = {
  coins: [],
  global: { data: { active_cryptocurrencies: 1, markets: 2, total_market_cap: {}, total_volume: {}, market_cap_percentage: {}, market_cap_change_percentage_24h_usd: 1 } }
};

describe("GET /api/v1/markets", () => {
  it("validates defaults and returns the application contract", async () => {
    let received: unknown;
    const app = createApp({ auth, database: { check: async () => undefined }, logger: false,
      markets: new GetMarkets({ getMarkets: async (query) => { received = query; return data; } }, () => new Date("2026-01-01T00:00:00.000Z")) });
    const response = await app.inject({ method: "GET", url: "/api/v1/markets" });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(received, { currency: "usd", page: 1, pageSize: 50 });
    assert.equal(response.json().fetchedAt, "2026-01-01T00:00:00.000Z");
    await app.close();
  });

  it("rejects invalid input before calling the provider", async () => {
    let called = false;
    const app = createApp({ auth, database: { check: async () => undefined }, logger: false,
      markets: new GetMarkets({ getMarkets: async () => { called = true; return data; } }) });
    const response = await app.inject({ method: "GET", url: "/api/v1/markets?currency=cop&page=0&pageSize=101" });
    assert.equal(response.statusCode, 422);
    assert.equal(response.json().code, "VALIDATION_ERROR");
    assert.equal(called, false);
    await app.close();
  });

  it("returns a safe translated upstream error", async () => {
    const app = createApp({ auth, database: { check: async () => undefined }, logger: false,
      markets: new GetMarkets({ getMarkets: async () => { throw new AppError("SERVICE_UNAVAILABLE", "Market data is temporarily unavailable."); } }) });
    const response = await app.inject({ method: "GET", url: "/api/v1/markets" });
    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.json().message, "Market data is temporarily unavailable.");
    await app.close();
  });
});

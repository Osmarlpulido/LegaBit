import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AppError } from "@legabit/api-contracts";

import { CachedMarketDataProvider } from "./market-cache.js";
import type { MarketCacheOutcome, MarketTelemetry } from "./market-telemetry.js";

const query = { currency: "usd" as const, page: 1, pageSize: 50 };
const first = {
  coins: [],
  global: { data: { active_cryptocurrencies: 1, markets: 2, total_market_cap: {}, total_volume: {}, market_cap_percentage: {}, market_cap_change_percentage_24h_usd: 1 } }
};

describe("CachedMarketDataProvider", () => {
  it("records bounded cache outcomes without query values", async () => {
    const outcomes: MarketCacheOutcome[] = [];
    const telemetry: MarketTelemetry = {
      providerRequest: () => undefined,
      providerRetry: () => undefined,
      cacheRequest: (outcome) => outcomes.push(outcome)
    };
    let now = 0;
    let fail = false;
    let release!: (value: typeof first) => void;
    const pending = new Promise<typeof first>((resolve) => { release = resolve; });
    const cache = new CachedMarketDataProvider({
      getMarkets: async () => {
        if (fail) throw new AppError("SERVICE_UNAVAILABLE", "unavailable");
        return pending;
      }
    }, { ttlMs: 100, staleIfErrorMs: 200, now: () => now, telemetry });

    const initial = cache.getMarkets(query);
    const shared = cache.getMarkets(query);
    release(first);
    await Promise.all([initial, shared]);
    await cache.getMarkets(query);
    now = 100;
    fail = true;
    await cache.getMarkets(query);

    assert.deepEqual(outcomes, ["miss", "coalesced", "hit", "miss", "stale"]);
  });

  it("shares a fresh result for identical queries but isolates different query keys", async () => {
    let calls = 0;
    const cache = new CachedMarketDataProvider({ getMarkets: async () => { calls += 1; return first; } });

    assert.equal(await cache.getMarkets(query), first);
    assert.equal(await cache.getMarkets(query), first);
    await cache.getMarkets({ ...query, page: 2 });

    assert.equal(calls, 2);
  });

  it("coalesces concurrent cache misses into one provider call", async () => {
    let calls = 0;
    let release!: (value: typeof first) => void;
    const providerResult = new Promise<typeof first>((resolve) => { release = resolve; });
    const cache = new CachedMarketDataProvider({ getMarkets: async () => { calls += 1; return providerResult; } });

    const one = cache.getMarkets(query);
    const two = cache.getMarkets(query);
    assert.equal(calls, 1);
    release(first);

    assert.deepEqual(await Promise.all([one, two]), [first, first]);
  });

  it("serves stale data when refresh fails within the stale window", async () => {
    let now = 0;
    let fail = false;
    const cache = new CachedMarketDataProvider({
      getMarkets: async () => {
        if (fail) throw new AppError("SERVICE_UNAVAILABLE", "unavailable");
        return first;
      }
    }, { ttlMs: 100, staleIfErrorMs: 200, now: () => now });

    await cache.getMarkets(query);
    now = 100;
    fail = true;

    assert.equal(await cache.getMarkets(query), first);
  });

  it("propagates provider errors after the stale window ends", async () => {
    let now = 0;
    let fail = false;
    const cache = new CachedMarketDataProvider({
      getMarkets: async () => {
        if (fail) throw new AppError("SERVICE_UNAVAILABLE", "unavailable");
        return first;
      }
    }, { ttlMs: 100, staleIfErrorMs: 200, now: () => now });

    await cache.getMarkets(query);
    now = 300;
    fail = true;

    await assert.rejects(cache.getMarkets(query), (error: unknown) =>
      error instanceof AppError && error.code === "SERVICE_UNAVAILABLE"
    );
  });
});

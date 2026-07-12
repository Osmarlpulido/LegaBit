import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AppError } from "@legabit/api-contracts";

import { CoinGeckoMarketDataProvider } from "./coingecko.js";

const coin = {
  id: "bitcoin", symbol: "btc", name: "Bitcoin", image: "https://example.test/btc.png",
  current_price: 10, market_cap: 100, market_cap_rank: 1,
  price_change_percentage_24h: 1, total_volume: 5, circulating_supply: 20,
  last_updated: "2026-01-01T00:00:00.000Z"
};
const global = {
  data: {
    active_cryptocurrencies: 1, markets: 2, total_market_cap: { usd: 100 },
    total_volume: { usd: 5 }, market_cap_percentage: { btc: 50 },
    market_cap_change_percentage_24h_usd: 1
  }
};

describe("CoinGeckoMarketDataProvider", () => {
  it("maps the neutral query to provider parameters and returns both resources", async () => {
    const urls: string[] = [];
    const provider = new CoinGeckoMarketDataProvider({
      fetch: async (input) => {
        const url = String(input);
        urls.push(url);
        return Response.json(url.includes("/global") ? global : [coin]);
      },
      maxRetries: 0
    });

    const result = await provider.getMarkets({ currency: "eur", page: 2, pageSize: 25 });
    assert.deepEqual(result, { coins: [coin], global });
    assert.match(urls.find((url) => url.includes("/coins/markets")) ?? "", /vs_currency=eur/);
    assert.match(urls.find((url) => url.includes("/coins/markets")) ?? "", /per_page=25/);
  });

  it("accepts legitimate nullable market values", async () => {
    const nullableCoin = {
      ...coin,
      current_price: null,
      market_cap: null,
      market_cap_rank: null,
      price_change_percentage_24h: null,
      price_change_percentage_7d_in_currency: null,
      total_volume: null,
      circulating_supply: null
    };
    const provider = new CoinGeckoMarketDataProvider({
      fetch: async (input) => Response.json(String(input).includes("/global") ? global : [nullableCoin]),
      maxRetries: 0
    });

    const result = await provider.getMarkets({ currency: "usd", page: 1, pageSize: 50 });
    assert.deepEqual(result.coins, [nullableCoin]);
  });

  it("translates malformed successful provider payloads to service unavailable", async () => {
    const provider = new CoinGeckoMarketDataProvider({
      fetch: async (input) => Response.json(String(input).includes("/global") ? global : [{ ...coin, current_price: "10" }]),
      maxRetries: 0
    });

    await assert.rejects(
      provider.getMarkets({ currency: "usd", page: 1, pageSize: 50 }),
      (error: unknown) => error instanceof AppError && error.code === "SERVICE_UNAVAILABLE"
    );
  });

  it("validates the successful global payload at runtime", async () => {
    const provider = new CoinGeckoMarketDataProvider({
      fetch: async (input) => Response.json(String(input).includes("/global")
        ? { data: { ...global.data, total_volume: "invalid" } }
        : [coin]),
      maxRetries: 0
    });

    await assert.rejects(
      provider.getMarkets({ currency: "usd", page: 1, pageSize: 50 }),
      (error: unknown) => error instanceof AppError && error.code === "SERVICE_UNAVAILABLE"
    );
  });

  it("retries a bounded number of safe transient failures", async () => {
    let calls = 0;
    const provider = new CoinGeckoMarketDataProvider({
      fetch: async (input) => {
        if (String(input).includes("/global")) return Response.json(global);
        calls += 1;
        return calls < 3 ? new Response(null, { status: 503 }) : Response.json([coin]);
      },
      maxRetries: 2,
      retryDelayMs: () => 0
    });
    await provider.getMarkets({ currency: "usd", page: 1, pageSize: 50 });
    assert.equal(calls, 3);
  });

  it("translates exhausted throttling without leaking provider details", async () => {
    const provider = new CoinGeckoMarketDataProvider({
      fetch: async () => new Response("secret provider response", { status: 429 }),
      maxRetries: 1,
      retryDelayMs: () => 0
    });
    await assert.rejects(
      provider.getMarkets({ currency: "usd", page: 1, pageSize: 50 }),
      (error: unknown) => error instanceof AppError && error.code === "RATE_LIMITED" && !error.message.includes("secret")
    );
  });

  it("aborts timed-out requests and translates them to service unavailable", async () => {
    const provider = new CoinGeckoMarketDataProvider({
      fetch: (_input, init) => new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      }),
      timeoutMs: 5,
      maxRetries: 0
    });
    await assert.rejects(
      provider.getMarkets({ currency: "usd", page: 1, pageSize: 50 }),
      (error: unknown) => error instanceof AppError && error.code === "SERVICE_UNAVAILABLE"
    );
  });
});

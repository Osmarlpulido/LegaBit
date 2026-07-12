import { metrics } from "@opentelemetry/api";

export type MarketProviderEndpoint = "coins" | "global";
export type MarketProviderOutcome = "success" | "throttled" | "upstream_error" | "timeout" | "malformed";
export type MarketCacheOutcome = "hit" | "miss" | "coalesced" | "stale";

export interface MarketTelemetry {
  providerRequest(endpoint: MarketProviderEndpoint, outcome: MarketProviderOutcome, durationMs: number): void;
  providerRetry(endpoint: MarketProviderEndpoint, reason: Exclude<MarketProviderOutcome, "success" | "malformed">): void;
  cacheRequest(outcome: MarketCacheOutcome): void;
}

const meter = metrics.getMeter("@legabit/backend/markets");
const providerRequests = meter.createCounter("legabit.market.provider.requests", {
  description: "CoinGecko HTTP requests, including retries"
});
const providerRetries = meter.createCounter("legabit.market.provider.retries", {
  description: "CoinGecko HTTP request retries"
});
const providerDuration = meter.createHistogram("legabit.market.provider.duration", {
  description: "CoinGecko HTTP request duration",
  unit: "ms"
});
const cacheRequests = meter.createCounter("legabit.market.cache.requests", {
  description: "Market cache lookup outcomes"
});

export const marketTelemetry: MarketTelemetry = {
  providerRequest(endpoint, outcome, durationMs) {
    const attributes = { endpoint, outcome };
    providerRequests.add(1, attributes);
    providerDuration.record(durationMs, attributes);
  },
  providerRetry(endpoint, reason) {
    providerRetries.add(1, { endpoint, reason });
  },
  cacheRequest(outcome) {
    cacheRequests.add(1, { outcome });
  }
};

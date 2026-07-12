import type { MarketsQuery, MarketsResponse } from "@legabit/api-contracts";

import type { MarketDataProvider } from "../modules/markets/markets.js";
import { marketTelemetry, type MarketTelemetry } from "./market-telemetry.js";

type MarketData = Omit<MarketsResponse, "fetchedAt">;

type CacheEntry = {
  data: MarketData;
  expiresAt: number;
  staleUntil: number;
};

export type CachedMarketDataProviderOptions = {
  ttlMs?: number;
  staleIfErrorMs?: number;
  now?: () => number;
  telemetry?: MarketTelemetry;
};

/**
 * Shares market results and in-flight loads across every request handled by one
 * API process. A distributed implementation can replace this decorator if the
 * service is horizontally scaled.
 */
export class CachedMarketDataProvider implements MarketDataProvider {
  private readonly entries = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, Promise<MarketData>>();
  private readonly ttlMs: number;
  private readonly staleIfErrorMs: number;
  private readonly now: () => number;
  private readonly telemetry: MarketTelemetry;

  constructor(
    private readonly provider: MarketDataProvider,
    options: CachedMarketDataProviderOptions = {}
  ) {
    this.ttlMs = options.ttlMs ?? 60_000;
    this.staleIfErrorMs = options.staleIfErrorMs ?? 5 * 60_000;
    this.now = options.now ?? Date.now;
    this.telemetry = options.telemetry ?? marketTelemetry;
  }

  async getMarkets(query: MarketsQuery): Promise<MarketData> {
    const key = this.key(query);
    const cached = this.entries.get(key);
    if (cached && this.now() < cached.expiresAt) {
      this.telemetry.cacheRequest("hit");
      return cached.data;
    }

    const pending = this.inFlight.get(key);
    if (pending) {
      this.telemetry.cacheRequest("coalesced");
      return pending;
    }

    this.telemetry.cacheRequest("miss");

    const load = this.load(key, query, cached);
    this.inFlight.set(key, load);
    try {
      return await load;
    } finally {
      this.inFlight.delete(key);
    }
  }

  private async load(key: string, query: MarketsQuery, cached?: CacheEntry): Promise<MarketData> {
    try {
      const data = await this.provider.getMarkets(query);
      const loadedAt = this.now();
      this.entries.set(key, {
        data,
        expiresAt: loadedAt + this.ttlMs,
        staleUntil: loadedAt + this.ttlMs + this.staleIfErrorMs
      });
      return data;
    } catch (error) {
      if (cached && this.now() < cached.staleUntil) {
        this.telemetry.cacheRequest("stale");
        return cached.data;
      }
      this.entries.delete(key);
      throw error;
    }
  }

  private key(query: MarketsQuery): string {
    return `${query.currency}:${query.page}:${query.pageSize}`;
  }
}

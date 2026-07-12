import {
  AppError,
  marketCoinSchema,
  marketGlobalDataSchema,
  type MarketCoin,
  type MarketGlobalData,
  type MarketsQuery
} from "@legabit/api-contracts";
import type { z } from "zod";

import type { MarketDataProvider } from "../modules/markets/markets.js";
import {
  marketTelemetry,
  type MarketProviderEndpoint,
  type MarketProviderOutcome,
  type MarketTelemetry
} from "./market-telemetry.js";

const DEFAULT_BASE_URL = "https://api.coingecko.com/api/v3";
const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

type Fetch = typeof fetch;

export type CoinGeckoOptions = {
  apiKey?: string;
  baseUrl?: string;
  fetch?: Fetch;
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: (attempt: number) => number;
  telemetry?: MarketTelemetry;
};

export class CoinGeckoMarketDataProvider implements MarketDataProvider {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly fetch: Fetch;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly retryDelayMs: (attempt: number) => number;
  private readonly telemetry: MarketTelemetry;

  constructor(options: CoinGeckoOptions = {}) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.fetch = options.fetch ?? globalThis.fetch;
    this.timeoutMs = options.timeoutMs ?? 5_000;
    this.maxRetries = options.maxRetries ?? 2;
    this.retryDelayMs = options.retryDelayMs ?? ((attempt) => 100 * (2 ** attempt) + Math.floor(Math.random() * 50));
    this.telemetry = options.telemetry ?? marketTelemetry;
  }

  async getMarkets(query: MarketsQuery): Promise<{ coins: MarketCoin[]; global: MarketGlobalData }> {
    const markets = new URL("/coins/markets", this.baseUrl);
    markets.search = new URLSearchParams({
      vs_currency: query.currency,
      order: "market_cap_desc",
      per_page: String(query.pageSize),
      page: String(query.page),
      sparkline: "true",
      price_change_percentage: "7d"
    }).toString();

    const [coins, global] = await Promise.all([
      this.request("coins", markets, marketCoinSchema.array()),
      this.request("global", new URL("/global", this.baseUrl), marketGlobalDataSchema)
    ]);
    return { coins, global };
  }

  private async request<T>(endpoint: MarketProviderEndpoint, url: URL, schema: z.ZodType<T>): Promise<T> {
    for (let attempt = 0; ; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
      const startedAt = performance.now();
      let outcome: MarketProviderOutcome = "upstream_error";
      try {
        const response = await this.fetch(url, {
          headers: this.apiKey ? { "x-cg-demo-api-key": this.apiKey } : undefined,
          signal: controller.signal
        });
        if (response.ok) {
          const parsed = schema.safeParse(await response.json());
          if (!parsed.success) {
            outcome = "malformed";
            throw new AppError("SERVICE_UNAVAILABLE", "Market data is temporarily unavailable.");
          }
          outcome = "success";
          return parsed.data;
        }

        outcome = response.status === 429 ? "throttled" : "upstream_error";
        if (RETRYABLE_STATUSES.has(response.status) && attempt < this.maxRetries) {
          this.telemetry.providerRetry(endpoint, outcome);
          await this.delay(attempt);
          continue;
        }
        if (response.status === 429) {
          throw new AppError("RATE_LIMITED", "Market data is temporarily rate limited.");
        }
        throw new AppError("SERVICE_UNAVAILABLE", "Market data is temporarily unavailable.");
      } catch (error) {
        if (error instanceof AppError) throw error;
        outcome = controller.signal.aborted ? "timeout" : "upstream_error";
        if (attempt < this.maxRetries) {
          this.telemetry.providerRetry(endpoint, outcome);
          await this.delay(attempt);
          continue;
        }
        throw new AppError("SERVICE_UNAVAILABLE", "Market data is temporarily unavailable.");
      } finally {
        clearTimeout(timeout);
        this.telemetry.providerRequest(endpoint, outcome, performance.now() - startedAt);
      }
    }
  }

  private async delay(attempt: number): Promise<void> {
    const milliseconds = this.retryDelayMs(attempt);
    if (milliseconds > 0) await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}

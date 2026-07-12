import { z } from "zod";

/**
 * Quote currencies currently supported by the LegaBit dashboard contract.
 * Provider-specific currency identifiers must not leak past the adapter.
 */
export const marketCurrencySchema = z.enum(["usd", "eur", "btc"]);

export const marketsQuerySchema = z.object({
  currency: marketCurrencySchema.default("usd"),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50)
});

export const marketCoinSchema = z.object({
  id: z.string().min(1),
  symbol: z.string().min(1),
  name: z.string().min(1),
  image: z.string(),
  current_price: z.number().nullable(),
  market_cap: z.number().nullable(),
  market_cap_rank: z.number().int().min(1).nullable(),
  price_change_percentage_24h: z.number().nullable(),
  price_change_percentage_7d_in_currency: z.number().nullable().optional(),
  total_volume: z.number().nullable(),
  circulating_supply: z.number().nullable(),
  sparkline_in_7d: z.object({ price: z.array(z.number()) }).optional(),
  last_updated: z.string().datetime()
});

export const marketGlobalDataSchema = z.object({
  data: z.object({
    active_cryptocurrencies: z.number().int().nonnegative(),
    markets: z.number().int().nonnegative(),
    total_market_cap: z.record(z.number()),
    total_volume: z.record(z.number()),
    market_cap_percentage: z.record(z.number()),
    market_cap_change_percentage_24h_usd: z.number()
  })
});

export const marketsResponseSchema = z.object({
  coins: z.array(marketCoinSchema),
  global: marketGlobalDataSchema,
  fetchedAt: z.string().datetime()
});

export type MarketCurrency = z.infer<typeof marketCurrencySchema>;
export type MarketsQuery = z.infer<typeof marketsQuerySchema>;
export type MarketCoin = z.infer<typeof marketCoinSchema>;
export type MarketGlobalData = z.infer<typeof marketGlobalDataSchema>;
export type MarketsResponse = z.infer<typeof marketsResponseSchema>;

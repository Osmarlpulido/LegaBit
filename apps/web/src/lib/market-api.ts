import {
  marketsResponseSchema,
  type MarketCurrency,
  type MarketsResponse
} from "@legabit/api-contracts";

import { apiRequest } from "@/lib/api-client";

export type MarketQuery = {
  currency: MarketCurrency;
  pageSize?: number;
  page?: number;
  signal?: AbortSignal;
};

/**
 * Browser boundary for the provider-neutral market API.
 *
 * The response currently retains the dashboard's established data shape. Keeping
 * that knowledge here prevents components and state management from depending on
 * backend routing or query-parameter conventions.
 */
export async function fetchMarketData({
  currency,
  pageSize = 50,
  page = 1,
  signal
}: MarketQuery): Promise<MarketsResponse> {
  const params = new URLSearchParams({
    currency,
    pageSize: String(pageSize),
    page: String(page)
  });
  return apiRequest(`/api/v1/markets?${params.toString()}`, {
    method: "GET",
    schema: marketsResponseSchema,
    signal
  });
}

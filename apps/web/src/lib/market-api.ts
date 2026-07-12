import {
  marketsResponseSchema,
  type MarketCurrency,
  type MarketsResponse
} from "@legabit/api-contracts";

import { ApiClientError, apiRequest } from "@/lib/api-client";

const MAX_MARKET_QUERY_RETRIES = 2;

/**
 * Retry only failures that are likely to recover without user action.
 *
 * Rate limits deliberately do not retry until the client supports an explicit
 * Retry-After/backoff policy. Contract-validation failures and other 4xx
 * responses are deterministic and must not create additional traffic either.
 */
export function shouldRetryMarketQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_MARKET_QUERY_RETRIES || !(error instanceof ApiClientError)) {
    return false;
  }

  if (error.code === "RATE_LIMITED" || error.status === 429) {
    return false;
  }

  if (error.status >= 400 && error.status < 500) {
    return false;
  }

  return (
    error.status === 0 ||
    (error.status >= 500 && error.status < 600 &&
      (error.code === "SERVICE_UNAVAILABLE" || error.code === "INTERNAL"))
  );
}

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

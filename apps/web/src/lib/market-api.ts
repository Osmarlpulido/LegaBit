import type { MarketCurrency, MarketsResponse } from "@legabit/api-contracts";

export type MarketQuery = {
  currency: MarketCurrency;
  pageSize?: number;
  page?: number;
};

type ErrorResponse = {
  message?: string;
  error?: string;
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
  page = 1
}: MarketQuery): Promise<MarketsResponse> {
  const params = new URLSearchParams({
    currency,
    pageSize: String(pageSize),
    page: String(page)
  });
  const response = await fetch(`/api/v1/markets?${params.toString()}`);

  if (!response.ok) {
    let body: ErrorResponse = {};

    try {
      body = (await response.json()) as ErrorResponse;
    } catch {
      // The status still gives callers a useful error when an upstream proxy
      // returns an empty or non-JSON response.
    }

    throw new Error(body.message ?? body.error ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<MarketsResponse>;
}

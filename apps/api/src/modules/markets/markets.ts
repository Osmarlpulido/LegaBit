import type { MarketsQuery, MarketsResponse } from "@legabit/api-contracts";

export interface MarketDataProvider {
  getMarkets(query: MarketsQuery): Promise<Omit<MarketsResponse, "fetchedAt">>;
}

export class GetMarkets {
  constructor(
    private readonly provider: MarketDataProvider,
    private readonly now: () => Date = () => new Date()
  ) {}

  async execute(query: MarketsQuery): Promise<MarketsResponse> {
    const data = await this.provider.getMarkets(query);
    return { ...data, fetchedAt: this.now().toISOString() };
  }
}

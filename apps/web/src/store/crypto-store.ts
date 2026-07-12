import { create } from "zustand";
import type {
  MarketCoin,
  MarketCurrency,
  MarketGlobalData
} from "@legabit/api-contracts";

import { fetchMarketData } from "@/lib/market-api";

type CryptoState = {
  coins: MarketCoin[];
  global: MarketGlobalData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  currency: MarketCurrency;

  fetchCoins: (currency?: MarketCurrency, perPage?: number) => Promise<void>;
  setCurrency: (currency: MarketCurrency) => void;
};

let latestRequestId = 0;

export const useCryptoStore = create<CryptoState>((set, get) => ({
  coins: [],
  global: null,
  loading: false,
  error: null,
  lastUpdated: null,
  currency: "usd",

  setCurrency: (currency: MarketCurrency) => {
    set({ currency });
    void get().fetchCoins(currency);
  },

  fetchCoins: async (currency?: MarketCurrency, perPage = 50) => {
    const requestId = ++latestRequestId;
    const activeCurrency = currency ?? get().currency;
    set({ loading: true, error: null });

    try {
      const data = await fetchMarketData({
        currency: activeCurrency,
        pageSize: perPage
      });

      if (requestId !== latestRequestId) {
        return;
      }

      set({
        coins: data.coins,
        global: data.global,
        lastUpdated: data.fetchedAt,
        loading: false,
        currency: activeCurrency
      });
    } catch (err) {
      if (requestId !== latestRequestId) {
        return;
      }

      set({
        loading: false,
        error: err instanceof Error ? err.message : "Error al obtener datos"
      });
    }
  }
}));

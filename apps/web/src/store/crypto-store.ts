import { create } from "zustand";
import type { MarketCurrency } from "@legabit/api-contracts";

import type { CoinMarket, GlobalData } from "@/lib/coingecko";
import { fetchMarketData } from "@/lib/market-api";

type CryptoState = {
  coins: CoinMarket[];
  global: GlobalData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  currency: MarketCurrency;

  fetchCoins: (currency?: MarketCurrency, perPage?: number) => Promise<void>;
  setCurrency: (currency: MarketCurrency) => void;
};

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
    const activeCurrency = currency ?? get().currency;
    set({ loading: true, error: null });

    try {
      const data = await fetchMarketData({
        currency: activeCurrency,
        pageSize: perPage
      });
      set({
        coins: data.coins,
        global: data.global,
        lastUpdated: data.fetchedAt,
        loading: false,
        currency: activeCurrency
      });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Error al obtener datos"
      });
    }
  }
}));

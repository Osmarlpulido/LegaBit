import { create } from "zustand";

import type { CoinMarket, GlobalData } from "@/lib/coingecko";

type ApiResponse = {
  coins: CoinMarket[];
  global: GlobalData;
  fetchedAt: string;
};

type CryptoState = {
  coins: CoinMarket[];
  global: GlobalData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  currency: string;

  fetchCoins: (currency?: string, perPage?: number) => Promise<void>;
  setCurrency: (currency: string) => void;
};

export const useCryptoStore = create<CryptoState>((set, get) => ({
  coins: [],
  global: null,
  loading: false,
  error: null,
  lastUpdated: null,
  currency: "usd",

  setCurrency: (currency: string) => {
    set({ currency });
    void get().fetchCoins(currency);
  },

  fetchCoins: async (currency?: string, perPage = 50) => {
    const activeCurrency = currency ?? get().currency;
    set({ loading: true, error: null });

    try {
      const params = new URLSearchParams({
        vs_currency: activeCurrency,
        per_page: String(perPage)
      });
      const res = await fetch(`/api/crypto?${params.toString()}`);

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data = (await res.json()) as ApiResponse;
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

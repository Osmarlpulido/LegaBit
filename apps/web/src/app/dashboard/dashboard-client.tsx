"use client";

import { useEffect, useMemo, useState } from "react";

import { CryptoTable } from "@/components/dashboard/crypto-table";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { useCryptoStore } from "@/store/crypto-store";

type Tab = "all" | "defi" | "layer1" | "stablecoins";

const DEFI_IDS = new Set([
  "uniswap", "aave", "compound-governance-token", "maker", "curve-dao-token",
  "pancakeswap-token", "sushi", "yearn-finance", "balancer", "1inch"
]);

const LAYER1_IDS = new Set([
  "bitcoin", "ethereum", "solana", "cardano", "avalanche-2", "polkadot",
  "cosmos", "near", "algorand", "tezos", "eos", "tron"
]);

const STABLE_IDS = new Set([
  "tether", "usd-coin", "binance-usd", "dai", "frax", "true-usd",
  "paxos-standard", "gemini-dollar", "liquity-usd", "usdd"
]);

function formatMarketCap(value: number): string {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2
  }).format(value);
}

export function DashboardClient() {
  const { coins, global, loading, error, lastUpdated, fetchCoins, setCurrency, currency } =
    useCryptoStore();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");

  useEffect(() => {
    void fetchCoins();
    const interval = setInterval(() => void fetchCoins(), 60_000);
    return () => clearInterval(interval);
  }, [fetchCoins]);

  const filteredCoins = useMemo(() => {
    let list = coins;

    if (activeTab === "defi") list = list.filter((c) => DEFI_IDS.has(c.id));
    else if (activeTab === "layer1") list = list.filter((c) => LAYER1_IDS.has(c.id));
    else if (activeTab === "stablecoins") list = list.filter((c) => STABLE_IDS.has(c.id));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
      );
    }

    return list;
  }, [coins, activeTab, search]);

  const globalData = global?.data;
  const totalMcap = globalData?.total_market_cap["usd"] ?? 0;
  const btcDominance = globalData?.market_cap_percentage["btc"] ?? 0;
  const ethDominance = globalData?.market_cap_percentage["eth"] ?? 0;
  const mcapChange = globalData?.market_cap_change_percentage_24h_usd ?? 0;

  const TABS: { key: Tab; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "layer1", label: "Layer 1" },
    { key: "defi", label: "DeFi" },
    { key: "stablecoins", label: "Stablecoins" }
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20 space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-legabit-gold">
          Legabit
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Dashboard Financiero
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Precios cripto en tiempo real via CoinGecko. Actualización automática cada 60 s.
        </p>
      </div>

      {globalData && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Market Cap total"
            value={formatMarketCap(totalMcap)}
            sub={`${mcapChange >= 0 ? "+" : ""}${mcapChange.toFixed(2)}% 24h`}
            positive={mcapChange >= 0}
          />
          <StatCard
            label="Dominancia BTC"
            value={`${btcDominance.toFixed(1)}%`}
            sub="del mercado total"
          />
          <StatCard
            label="Dominancia ETH"
            value={`${ethDominance.toFixed(1)}%`}
            sub="del mercado total"
          />
          <StatCard
            label="Activos listados"
            value={globalData.active_cryptocurrencies.toLocaleString("es")}
            sub={`en ${globalData.markets} mercados`}
          />
        </div>
      )}

      <div className="space-y-4">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          currency={currency}
          onCurrencyChange={setCurrency}
          onRefresh={() => void fetchCoins()}
          loading={loading}
          lastUpdated={lastUpdated}
        />

        <div className="flex gap-1 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-legabit-gold text-legabit-charcoal"
                  : "border-transparent text-muted-foreground hover:text-legabit-charcoal"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Error al cargar datos:</strong> {error}. Comprueba tu conexión o vuelve a intentarlo.
        </div>
      )}

      <CryptoTable coins={filteredCoins} currency={currency} loading={loading} />

      <p className="text-center text-xs text-muted-foreground">
        Datos proporcionados por{" "}
        <a
          href="https://www.coingecko.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-legabit-petrol"
        >
          CoinGecko
        </a>
        . Solo con fines informativos, no constituye asesoramiento financiero.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  positive
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      {sub && (
        <p
          className={`mt-0.5 text-xs tabular-nums ${
            positive === undefined
              ? "text-muted-foreground"
              : positive
                ? "text-legabit-gold font-medium"
                : "text-red-500 font-medium"
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

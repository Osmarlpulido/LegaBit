"use client";

import { useState } from "react";

import type { CoinMarket } from "@/lib/coingecko";
import { PriceChart } from "@/components/dashboard/price-chart";

type CryptoTableProps = {
  coins: CoinMarket[];
  currency: string;
  loading: boolean;
};

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
    notation: value >= 1_000_000_000 ? "compact" : "standard"
  }).format(value);
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat("es", {
    notation: "compact",
    maximumFractionDigits: 2
  }).format(value);
}

type SortKey = "market_cap_rank" | "current_price" | "price_change_percentage_24h" | "total_volume";

export function CryptoTable({ coins, currency, loading }: CryptoTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("market_cap_rank");
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<CoinMarket | null>(null);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(key === "market_cap_rank");
    }
  }

  const sorted = [...coins].sort((a, b) => {
    const av = a[sortKey] ?? 0;
    const bv = b[sortKey] ?? 0;
    return sortAsc ? av - bv : bv - av;
  });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="ml-1 text-muted-foreground/40">↕</span>;
    return <span className="ml-1 text-legabit-gold">{sortAsc ? "↑" : "↓"}</span>;
  }

  function ThBtn({
    col,
    children,
    className = ""
  }: {
    col: SortKey;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <th
        className={`px-4 py-3 font-medium cursor-pointer select-none hover:text-legabit-charcoal ${className}`}
        onClick={() => handleSort(col)}
      >
        {children}
        <SortIcon col={col} />
      </th>
    );
  }

  if (loading && coins.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-legabit-gold border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando datos de mercado…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedCoin && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">
              Gráfico 7 días — {selectedCoin.name}
            </h3>
            <button
              onClick={() => setSelectedCoin(null)}
              className="text-xs text-muted-foreground hover:text-legabit-charcoal"
            >
              Cerrar
            </button>
          </div>
          <PriceChart coin={selectedCoin} currency={currency} />
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <ThBtn col="market_cap_rank" className="w-12 text-center">#</ThBtn>
              <th className="px-4 py-3 font-medium">Moneda</th>
              <ThBtn col="current_price" className="text-right">Precio</ThBtn>
              <ThBtn col="price_change_percentage_24h" className="text-right">24h %</ThBtn>
              <th className="px-4 py-3 font-medium text-right">Mkt. Cap</th>
              <ThBtn col="total_volume" className="text-right">Volumen 24h</ThBtn>
              <th className="px-4 py-3 font-medium text-center">Gráfico</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((coin) => {
              const change = coin.price_change_percentage_24h ?? 0;
              const isPositive = change >= 0;
              return (
                <tr
                  key={coin.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 text-center tabular-nums text-muted-foreground text-xs">
                    {coin.market_cap_rank}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="h-6 w-6 rounded-full flex-shrink-0"
                      />
                      <div>
                        <p className="font-medium leading-tight">{coin.name}</p>
                        <p className="text-[10px] uppercase text-muted-foreground">{coin.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">
                    {formatCurrency(coin.current_price, currency)}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums font-medium text-sm ${isPositive ? "text-legabit-gold" : "text-red-500"}`}>
                    {isPositive ? "+" : ""}
                    {change.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {formatCurrency(coin.market_cap, currency)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {formatCompact(coin.total_volume)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() =>
                        setSelectedCoin(selectedCoin?.id === coin.id ? null : coin)
                      }
                      className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                        selectedCoin?.id === coin.id
                          ? "bg-legabit-petrol text-legabit-ivory"
                          : "bg-muted text-muted-foreground hover:bg-legabit-gold/20"
                      }`}
                    >
                      {selectedCoin?.id === coin.id ? "Ocultar" : "Ver"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

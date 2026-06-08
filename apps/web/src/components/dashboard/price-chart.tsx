"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { CoinMarket } from "@/lib/coingecko";

type PriceChartProps = {
  coin: CoinMarket;
  currency: string;
};

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
    notation: value >= 1_000_000 ? "compact" : "standard"
  }).format(value);
}

export function PriceChart({ coin, currency }: PriceChartProps) {
  const sparkline = coin.sparkline_in_7d?.price ?? [];

  if (sparkline.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-muted/20">
        <p className="text-sm text-muted-foreground">Sin datos de gráfico</p>
      </div>
    );
  }

  const data = sparkline.map((price, i) => ({
    day: i,
    price
  }));

  const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0;
  const strokeColor = isPositive ? "#C2A95D" : "#ef4444";
  const fillId = `fill-${coin.id}`;

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
        <div>
          <p className="font-semibold leading-tight">{coin.name}</p>
          <p className="text-xs uppercase text-muted-foreground">{coin.symbol}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-semibold tabular-nums">
            {formatCurrency(coin.current_price, currency)}
          </p>
          <p
            className={`text-xs tabular-nums font-medium ${isPositive ? "text-legabit-gold" : "text-red-500"}`}
          >
            {isPositive ? "+" : ""}
            {coin.price_change_percentage_24h?.toFixed(2)}%
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="day" hide />
          <YAxis
            domain={["auto", "auto"]}
            tickFormatter={(v: number) =>
              new Intl.NumberFormat("es", {
                notation: "compact",
                maximumFractionDigits: 2
              }).format(v)
            }
            width={60}
            tick={{ fontSize: 10, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => {
              const price = typeof value === "number" ? value : Number(value ?? 0);
              return [formatCurrency(price, currency), "Precio"];
            }}
            labelFormatter={() => ""}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "12px"
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={2}
            fill={`url(#${fillId})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

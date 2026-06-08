"use client";

type FilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (value: string) => void;
  onRefresh: () => void;
  loading: boolean;
  lastUpdated: string | null;
};

const CURRENCIES = [
  { value: "usd", label: "USD $" },
  { value: "eur", label: "EUR €" },
  { value: "btc", label: "BTC ₿" }
];

export function FilterBar({
  search,
  onSearchChange,
  currency,
  onCurrencyChange,
  onRefresh,
  loading,
  lastUpdated
}: FilterBarProps) {
  const formattedTime = lastUpdated
    ? new Intl.DateTimeFormat("es", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(new Date(lastUpdated))
    : null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-48">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          placeholder="Buscar moneda…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-legabit-petrol/30"
        />
      </div>

      <div className="flex rounded-lg border border-border overflow-hidden">
        {CURRENCIES.map((cur) => (
          <button
            key={cur.value}
            onClick={() => onCurrencyChange(cur.value)}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              currency === cur.value
                ? "bg-legabit-petrol text-legabit-ivory"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {cur.label}
          </button>
        ))}
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          aria-hidden="true"
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
        Actualizar
      </button>

      {formattedTime && (
        <span className="text-xs text-muted-foreground">
          Actualizado: {formattedTime}
        </span>
      )}
    </div>
  );
}

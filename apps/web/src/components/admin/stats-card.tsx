type Trend = { value: number; label: string };

type StatsCardProps = {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: Trend;
};

export function StatsCard({ title, value, subtitle, trend }: StatsCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{typeof value === "number" ? value.toLocaleString() : value}</p>
      {trend && (
        <p className={`mt-1 text-sm font-medium ${trend.value >= 0 ? "text-green-600" : "text-red-600"}`}>
          {trend.value >= 0 ? "+" : ""}{trend.value} {trend.label}
        </p>
      )}
      {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}

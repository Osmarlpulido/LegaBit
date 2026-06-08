import type { Metadata } from "next";

import { DashboardClient } from "@/app/dashboard/dashboard-client";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "Dashboard Financiero — Legabit",
  description:
    "Panel de precios en tiempo real: criptomonedas, DeFi y métricas de mercado global."
};

export default function DashboardPage() {
  return (
    <MarketingShell>
      <DashboardClient />
    </MarketingShell>
  );
}

import { type NextRequest, NextResponse } from "next/server";

import { fetchGlobal, fetchMarkets } from "@/lib/coingecko";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const currency = searchParams.get("vs_currency") ?? "usd";
  const perPage = Math.min(Number(searchParams.get("per_page") ?? "50"), 100);
  const page = Number(searchParams.get("page") ?? "1");

  try {
    const [coins, global] = await Promise.all([
      fetchMarkets(currency, perPage, page),
      fetchGlobal()
    ]);

    return NextResponse.json(
      { coins, global, fetchedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120"
        }
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

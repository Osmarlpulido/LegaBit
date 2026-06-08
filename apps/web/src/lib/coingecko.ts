const BASE_URL = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.COINGECKO_API_KEY;

const defaultHeaders: HeadersInit = API_KEY
  ? { "x-cg-demo-api-key": API_KEY }
  : {};

async function cgFetch<T>(path: string, revalidate = 60): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: defaultHeaders,
    next: { revalidate }
  });

  if (!res.ok) {
    throw new Error(`CoinGecko error ${res.status}: ${res.statusText} — ${path}`);
  }

  return res.json() as Promise<T>;
}

export type CoinMarket = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  total_volume: number;
  circulating_supply: number;
  sparkline_in_7d?: { price: number[] };
  last_updated: string;
};

export type GlobalData = {
  data: {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    market_cap_percentage: Record<string, number>;
    market_cap_change_percentage_24h_usd: number;
  };
};

export type CoinDetail = {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  image: { thumb: string; small: string; large: string };
  market_data: {
    current_price: Record<string, number>;
    market_cap: Record<string, number>;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    ath: Record<string, number>;
    ath_change_percentage: Record<string, number>;
  };
};

export type CoinPriceHistory = {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
};

/**
 * Lista de monedas con datos de mercado.
 * @param currency Moneda de cotización (default: "usd")
 * @param perPage Número de resultados (default: 50)
 * @param page Página (default: 1)
 */
export async function fetchMarkets(
  currency = "usd",
  perPage = 50,
  page = 1
): Promise<CoinMarket[]> {
  return cgFetch<CoinMarket[]>(
    `/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=7d`,
    60
  );
}

/**
 * Datos globales del mercado cripto.
 */
export async function fetchGlobal(): Promise<GlobalData> {
  return cgFetch<GlobalData>("/global", 120);
}

/**
 * Detalle de una moneda específica.
 */
export async function fetchCoinDetail(coinId: string): Promise<CoinDetail> {
  return cgFetch<CoinDetail>(
    `/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
    120
  );
}

/**
 * Historial de precios de una moneda (últimos N días).
 */
export async function fetchCoinHistory(
  coinId: string,
  days: number = 7,
  currency = "usd"
): Promise<CoinPriceHistory> {
  return cgFetch<CoinPriceHistory>(
    `/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}&interval=daily`,
    300
  );
}

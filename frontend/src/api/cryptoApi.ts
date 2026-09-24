
import type { GlobalMarketData } from "../components/GlobalMarket";
import type { TrendingResponse } from "../components/TrendingCoins";
import type { WatchlistCoin } from "../components/Watchlist";
import type { SearchCoin } from "../components/CoinSearch";
import type { HistoryPoint } from "../components/HistoricalPriceChart";
import type { AnalysisResponse } from "../components/CoinAnalysis";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

type HistoryResponse = {
  prices: HistoryPoint[];
};

async function ensureOk(
  response: Response,
  action: string,
): Promise<void> {
  if (response.ok) return;

  if (response.status === 429) {
    throw new Error(
      "CoinGecko rate limit reached. Please try again later.",
    );
  }

  throw new Error(
    `${action} (HTTP ${response.status}).`,
  );
}

export async function getGlobalMarket(): Promise<GlobalMarketData> {
  const response = await fetch(`${API_BASE_URL}/global`);

  await ensureOk(response, "Unable to load global market data");

  return response.json();
}

export async function getTrendingCoins(): Promise<TrendingResponse> {
  const response = await fetch(`${API_BASE_URL}/trending`);

  await ensureOk(response, "Unable to load trending coins");

  const data: TrendingResponse = await response.json();

  if (!Array.isArray(data?.coins)) {
    throw new Error("Unexpected trending response format.");
  }

  return data;
}

export async function getWatchlist(): Promise<WatchlistCoin[]> {
  const response = await fetch(`${API_BASE_URL}/watchlist`);

  await ensureOk(response, "Unable to load watchlist");

  const data: WatchlistCoin[] = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Unexpected watchlist response format.");
  }

  return data;
}

export async function searchCoins(
  query: string,
): Promise<SearchCoin[]> {
  const response = await fetch(
    `${API_BASE_URL}/search?query=${encodeURIComponent(query)}`,
  );

  await ensureOk(response, "Search failed");

  const data: SearchCoin[] = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Unexpected search response format.");
  }

  return data;
}

export async function addWatchlistCoin(
  coinId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/watchlist/${encodeURIComponent(coinId)}`,
    { method: "POST" },
  );

  await ensureOk(response, "Unable to add coin to watchlist");
}

export async function removeWatchlistCoin(
  coinId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/watchlist/${encodeURIComponent(coinId)}`,
    { method: "DELETE" },
  );

  await ensureOk(response, "Unable to remove coin");
}

export async function getCoinHistory(
  coinId: string,
  days: number = 30,
): Promise<HistoryResponse> {
  const response = await fetch(
    `${API_BASE_URL}/coins/${encodeURIComponent(coinId)}/history?days=${days}`,
  );

  await ensureOk(response, "Unable to load price history");

  const data: HistoryResponse = await response.json();

  if (!Array.isArray(data?.prices)) {
    throw new Error("Invalid price history response.");
  }

  return data;
}

export async function getCoinAnalysis(
  coinId: string,
): Promise<AnalysisResponse> {
  const response = await fetch(
    `${API_BASE_URL}/coins/${encodeURIComponent(coinId)}/analysis`,
  );

  await ensureOk(response, "Unable to load analysis");

  const data: AnalysisResponse = await response.json();

  if (!data?.indicators || !data?.overall) {
    throw new Error("Invalid analysis response.");
  }

  return data;
}
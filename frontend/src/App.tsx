import { useEffect, useState } from "react";
import "./App.css";

import GlobalMarket, {
  type GlobalMarketData,
} from "./components/GlobalMarket";

import TrendingCoins, {
  type TrendingResponse,
} from "./components/TrendingCoins";

import Watchlist, {
  type WatchlistCoin,
} from "./components/Watchlist";

import CoinSearch, {
  type SearchCoin,
} from "./components/CoinSearch";

import HistoricalPriceChart, {
  type HistoryPoint,
} from "./components/HistoricalPriceChart";

import CoinAnalysis, {
  type AnalysisResponse,
} from "./components/CoinAnalysis";

type HistoryResponse = {
  prices: HistoryPoint[];
};

const CACHE_DURATION = 60_000; // 60 seconds

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

function getCachedData<T>(key: string): T | null {
  const stored = localStorage.getItem(key);

  if (!stored) {
    return null;
  }

  try {
    const cached: CacheEntry<T> = JSON.parse(stored);

    const isExpired =
      Date.now() - cached.timestamp > CACHE_DURATION;

    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    return cached.data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function setCachedData<T>(key: string, data: T) {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
  };

  localStorage.setItem(key, JSON.stringify(entry));
}

function App() {
  const [globalMarket, setGlobalMarket] =
  useState<GlobalMarketData | null>(null);
  const [trending, setTrending] = useState<TrendingResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchCoin[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistCoin[]>([]);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<SearchCoin | null>(null);
  const [priceHistory, setPriceHistory] = useState<HistoryPoint[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [trendingError, setTrendingError] = useState<string | null>(null);
  const [watchlistError, setWatchlistError] = useState<string | null>(null);
  const [pendingCoinId, setPendingCoinId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGlobalMarket() {
      setGlobalError(null);

      const cached = getCachedData<GlobalMarketData>("global-market");

      if (cached) {
        setGlobalMarket(cached);
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/global"
        );

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error(
              "CoinGecko rate limit reached. Please try again later."
            );
          }

          throw new Error(
            `Unable to load global market data (HTTP ${response.status}).`
          );
        }

        const data: GlobalMarketData = await response.json();

        setGlobalMarket(data);
        setCachedData("global-market", data);
      } catch (error) {
        setGlobalError(
          error instanceof Error
            ? error.message
            : "Unable to load global market data."
        );
      }
    }

    fetchGlobalMarket();

    async function fetchTrending() {
      setTrendingError(null);

      const cached = getCachedData<TrendingResponse>("trending-coins");

      if (cached) {
        setTrending(cached);
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/trending"
        );

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error(
              "CoinGecko rate limit reached. Trending coins will be available again shortly."
            );
          }

          throw new Error(
            `Unable to load trending coins (HTTP ${response.status}).`
          );
        }

        const data: TrendingResponse = await response.json();

        setTrending(data);
        setCachedData("trending-coins", data);
      } catch (error) {
        setTrendingError(
          error instanceof Error
            ? error.message
            : "Unable to load trending coins."
        );
      }
    }

    fetchTrending();

    async function fetchWatchlist() {
      setIsLoadingWatchlist(true);
      setWatchlistError(null);

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/watchlist"
        );

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error(
              "CoinGecko rate limit reached. Please try again later."
            );
          }

          throw new Error(
            `Unable to load watchlist (HTTP ${response.status}).`
          );
        }

        const data: WatchlistCoin[] = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected watchlist response format.");
        }

        setWatchlist(data);
      } catch (error) {
        setWatchlistError(
          error instanceof Error
            ? error.message
            : "Unable to load watchlist."
        );
      } finally {
        setIsLoadingWatchlist(false);
        console.log("Watchlist loading finished");
      }
    }

    fetchWatchlist();
  }, []);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/search?query=${encodeURIComponent(query)}`,
      );

      if (!response.ok) {
        throw new Error(`Search failed (HTTP ${response.status}).`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected search response format.");
      }

      setSearchResults(data);
    } catch (error) {
      setSearchError(
        error instanceof Error ? error.message : "Unable to search coins.",
      );
    } finally {
      setIsSearching(false);
    }
  }

async function addToWatchlist(coin: SearchCoin) {
  // NEW: Prevent another Add request while one is running
  if (pendingCoinId !== null) return;

  // NEW: Remember which coin is being added
  setPendingCoinId(coin.id);

  setWatchlistError(null);

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/watchlist/${encodeURIComponent(coin.id)}`,
      {
        method: "POST",
      }
    );

    const responseBody = await response.text();

    console.log("Watchlist POST status:", response.status);
    console.log("Watchlist POST response:", responseBody);

    if (!response.ok) {
      throw new Error(
        `Unable to add ${coin.name} (HTTP ${response.status}): ${responseBody}`
      );
    }

    const watchlistResponse = await fetch(
      "http://127.0.0.1:8000/watchlist"
    );

    if (!watchlistResponse.ok) {
      throw new Error(
        `Unable to refresh watchlist (HTTP ${watchlistResponse.status}).`
      );
    }

    const updatedWatchlist: WatchlistCoin[] =
      await watchlistResponse.json();

    if (!Array.isArray(updatedWatchlist)) {
      throw new Error("Unexpected watchlist response format.");
    }

    setWatchlist(updatedWatchlist);

    console.log(`Successfully added ${coin.name}.`);
  } catch (error) {
    console.error("Watchlist error:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Unable to add coin to watchlist."
    );
  } finally {
    // NEW: Always unlock the Add button
    setPendingCoinId(null);
  }
}

  async function loadCoinHistory(coin: SearchCoin) {
    setSelectedCoin(coin);

    setPriceHistory([]);
    setAnalysis(null);

    setHistoryError(null);
    setAnalysisError(null);

    setIsLoadingHistory(true);
    setIsLoadingAnalysis(true);

    // Historical prices
    async function fetchHistory() {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/coins/${encodeURIComponent(coin.id)}/history`,
        );

        if (!response.ok) {
          throw new Error(
            `Unable to load price history (HTTP ${response.status}).`,
          );
        }

        const data: HistoryResponse = await response.json();

        if (!Array.isArray(data?.prices)) {
          throw new Error("Invalid price history response.");
        }

        setPriceHistory(data.prices);
      } catch (error) {
        setHistoryError(
          error instanceof Error
            ? error.message
            : "Unable to load price history.",
        );
      } finally {
        setIsLoadingHistory(false);
      }
    }

    // Technical indicators and overall analysis
    async function fetchAnalysis() {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/coins/${encodeURIComponent(coin.id)}/analysis`,
        );

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Rate limit reached. Please try again later.");
          }

          throw new Error(`Unable to load analysis (HTTP ${response.status}).`);
        }

        const data: AnalysisResponse = await response.json();

        if (!data?.indicators || !data?.overall) {
          throw new Error("Invalid analysis response.");
        }

        setAnalysis(data);
      } catch (error) {
        setAnalysisError(
          error instanceof Error ? error.message : "Unable to load analysis.",
        );
      } finally {
        setIsLoadingAnalysis(false);
      }
    }

    await Promise.all([fetchHistory(), fetchAnalysis()]);
  }

  async function removeFromWatchlist(coinId: string) {
    const response = await fetch(`http://127.0.0.1:8000/watchlist/${coinId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      console.error("Failed to remove coin from watchlist");
      return;
    }

    setWatchlist((currentWatchlist) =>
      currentWatchlist.filter((coin) => coin.id !== coinId),
    );
  }
  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Crypto Dashboard</h1>
          <p>Market data and technical analysis in one place.</p>
        </div>
      </header>

      <main className="dashboard">
        <CoinSearch
          searchQuery={searchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          searchError={searchError}
          pendingCoinId={pendingCoinId}
          onQueryChange={setSearchQuery}
          onSearch={handleSearch}
          onAdd={addToWatchlist}
          onView={loadCoinHistory}
        />
        <GlobalMarket
          globalMarket={globalMarket}
          globalError={globalError}
        />   
        <TrendingCoins
          trending={trending}
          trendingError={trendingError}
        />
        <Watchlist
          watchlist={watchlist}
          isLoadingWatchlist={isLoadingWatchlist}
          watchlistError={watchlistError}
          onRemove={removeFromWatchlist}
        />
        <HistoricalPriceChart
          coinName={selectedCoin?.name ?? null}
          history={priceHistory}
          isLoading={isLoadingHistory}
          error={historyError}
        />
        <CoinAnalysis
          coinName={selectedCoin?.name ?? null}
          analysis={analysis}
          isLoadingAnalysis={isLoadingAnalysis}
          analysisError={analysisError}
        />
      </main>
    </div>
  );
}

export default App;

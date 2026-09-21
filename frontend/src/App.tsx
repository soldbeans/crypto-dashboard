import { useEffect, useRef, useState } from "react";
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

import {
  getGlobalMarket,
  getTrendingCoins,
  getWatchlist,
  searchCoins,
  addWatchlistCoin,
  removeWatchlistCoin,
  getCoinHistory,
  getCoinAnalysis,
} from "./api/cryptoApi";

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
  
  const latestCoinRequest = useRef(0);

  useEffect(() => {
    async function fetchGlobalMarket() {
      setGlobalError(null);

      const cached = getCachedData<GlobalMarketData>("global-market");

      if (cached) {
        setGlobalMarket(cached);
        return;
      }

      try {
        const data = await getGlobalMarket();

        setGlobalMarket(data);
        setCachedData("global-market", data);
      } catch (error) {
        setGlobalError(
          error instanceof Error
            ? error.message
            : "Unable to load global market data.",
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
        const data = await getTrendingCoins();

        setTrending(data);
        setCachedData("trending-coins", data);
      } catch (error) {
        setTrendingError(
          error instanceof Error
            ? error.message
            : "Unable to load trending coins.",
        );
      }
    }

    fetchTrending();

    async function fetchWatchlist() {
      setIsLoadingWatchlist(true);
      setWatchlistError(null);

      try {
        const data = await getWatchlist();

        setWatchlist(data);
      } catch (error) {
        setWatchlistError(
          error instanceof Error
            ? error.message
            : "Unable to load watchlist.",
        );
      } finally {
        setIsLoadingWatchlist(false);
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
      const data = await searchCoins(query);

      setSearchResults(data);
    } catch (error) {
      setSearchError(
        error instanceof Error
          ? error.message
          : "Unable to search coins.",
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
    await addWatchlistCoin(coin.id);

    const updatedWatchlist = await getWatchlist();

    setWatchlist(updatedWatchlist);
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
  // Give this selection a unique ID.
  const requestId = ++latestCoinRequest.current;

  // Only the newest selection may update the screen.
  const isLatestRequest = () =>
    requestId === latestCoinRequest.current;

  setSelectedCoin(coin);
  setPriceHistory([]);
  setAnalysis(null);
  setHistoryError(null);
  setAnalysisError(null);
  setIsLoadingHistory(true);
  setIsLoadingAnalysis(true);

  async function fetchHistory() {
    try {
      const data = await getCoinHistory(coin.id);

      if (isLatestRequest()) {
        setPriceHistory(data.prices);
      }
    } catch (error) {
      if (isLatestRequest()) {
        setHistoryError(
          error instanceof Error
            ? error.message
            : "Unable to load price history.",
        );
      }
    } finally {
      if (isLatestRequest()) {
        setIsLoadingHistory(false);
      }
    }
  }

  async function fetchAnalysis() {
    try {
      const data = await getCoinAnalysis(coin.id);

      if (isLatestRequest()) {
        setAnalysis(data);
      }
    } catch (error) {
      if (isLatestRequest()) {
        setAnalysisError(
          error instanceof Error
            ? error.message
            : "Unable to load analysis.",
        );
      }
    } finally {
      if (isLatestRequest()) {
        setIsLoadingAnalysis(false);
      }
    }
  }

  await Promise.all([fetchHistory(), fetchAnalysis()]);
}

async function removeFromWatchlist(coinId: string) {
  try {
    await removeWatchlistCoin(coinId);

    setWatchlist((currentWatchlist) =>
      currentWatchlist.filter((coin) => coin.id !== coinId),
    );
  } catch (error) {
    console.error("Failed to remove coin from watchlist:", error);

    alert(
      error instanceof TypeError
        ? "Could not connect to the server. Please check that FastAPI is running."
        : error instanceof Error
          ? error.message
          : "Unable to remove coin from watchlist.",
    );
  }  
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

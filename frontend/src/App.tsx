import { useEffect, useState } from "react";
import "./App.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import GlobalMarket, {
  type GlobalMarketData,
} from "./components/GlobalMarket";

type GlobalMarket = {
  market_cap_usd: number;
  volume_24h_usd: number;
  btc_dominance: number;
  eth_dominance: number;
  active_cryptocurrencies: number;
  markets: number;
  last_updated: number;
};

type TrendingCoin = {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
};

type TrendingResponse = {
  count: number;
  coins: TrendingCoin[];
};

type SearchCoin = {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
};

type WatchlistCoin = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  market_cap: number;
  change_24h: number;
  high_24h: number;
  low_24h: number;
};

type HistoryPoint = {
  timestamp: number;
  price: number;
};

type HistoryResponse = {
  prices: HistoryPoint[];
};

type IndicatorValue = {
  value: number | null;
  signal: string;
};

type MACDValue = {
  value: number | null;
  signal_line: number | null;
  histogram: number | null;
  trend: string;
};

type AnalysisResponse = {
  coin: string;
  current_price: number;
  indicators: {
    rsi: IndicatorValue;
    sma: IndicatorValue;
    ema: IndicatorValue;
    macd: MACDValue;
  };
  overall: {
    score: number;
    recommendation: string;
    strength: string;
    reasons: string[];
  };
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
        <section className="dashboard-section">
          <h2>Coin Search</h2>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search Bitcoin, Ethereum..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />

            <button type="submit">Search</button>
          </form>

          {isSearching && <div className="placeholder-card">Searching...</div>}
          {!isSearching && searchError && (
            <div className="error-card" role="alert">
              {searchError}
            </div>
          )}
          {!isSearching && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.slice(0, 5).map((coin) => (
                <div className="search-result" key={coin.id}>
                  <div className="search-result-info">
                    <strong>{coin.name}</strong>
                    <span>{coin.symbol}</span>
                    <span>{coin.id}</span>
                  </div>

                  <button
                    type="button"
                    className="watchlist-button"
                    disabled={pendingCoinId !== null}
                    onClick={() => addToWatchlist(coin)}
                  >
                    {pendingCoinId === coin.id ? "Adding..." : "Add"}
                  </button>
                  <button
                    className="watchlist-button"
                    onClick={() => loadCoinHistory(coin)}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        <GlobalMarket
          globalMarket={globalMarket}
          globalError={globalError}
        />

        <section className="dashboard-section">
          <h2>Trending Coins</h2>

          {trendingError ? (
            <div className="error-card" role="alert">
              {trendingError}
            </div>
          ) : trending ? (
            <div className="trending-list">
              {trending.coins.slice(0, 5).map((coin) => (
                <div className="trending-coin" key={coin.id}>
                  <img src={coin.thumb} alt={coin.name} />

                  <div className="trending-info">
                    <strong>{coin.name}</strong>
                    <span>{coin.symbol}</span>
                  </div>

                  <span className="rank">#{coin.market_cap_rank ?? "—"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="placeholder-card">Loading trending coins...</div>
          )}
        </section>
        <section className="dashboard-section">
          <h2>Watchlist</h2>

          {isLoadingWatchlist ? (
            <div className="placeholder-card">
              Loading watchlist...
            </div>
          ) : watchlistError ? (
            <div className="error-card" role="alert">
              {watchlistError}
            </div>
          ) : watchlist.length > 0 ? (
            <div className="watchlist-list">
              {watchlist.map((coin) => (
                <div className="watchlist-item" key={coin.id}>
                  <div className="watchlist-main">
                    <strong>{coin.name}</strong>
                    <span>{coin.symbol}</span>
                  </div>

                  <div className="watchlist-actions">
                    <div className="watchlist-price">
                      <strong>${coin.price.toLocaleString()}</strong>
                      <span>
                        {coin.change_24h >= 0 ? "+" : ""}
                        {coin.change_24h.toFixed(2)}%
                      </span>
                    </div>

                    <button
                      className="remove-button"
                      onClick={() => removeFromWatchlist(coin.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="placeholder-card">Your watchlist is empty.</div>
          )}
        </section>
        <section className="dashboard-section">
          <h2>
            Historical Price
            {selectedCoin && ` — ${selectedCoin.name}`}
          </h2>

          {isLoadingHistory ? (
            <div className="placeholder-card">Loading price history...</div>
          ) : historyError ? (
            <div className="error-card" role="alert">
              {historyError}
            </div>
          ) : priceHistory.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceHistory}>
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(timestamp) =>
                      new Date(Number(timestamp)).toLocaleDateString()
                    }
                  />

                  <YAxis
                    domain={["auto", "auto"]}
                    tickFormatter={(value) =>
                      `$${Number(value).toLocaleString()}`
                    }
                  />

                  <Tooltip
                    labelFormatter={(timestamp) =>
                      new Date(Number(timestamp)).toLocaleDateString()
                    }
                    formatter={(value) => [
                      `$${Number(value).toLocaleString()}`,
                      "Price",
                    ]}
                  />

                  <Line type="monotone" dataKey="price" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="placeholder-card">
              Select a coin to view its price history.
            </div>
          )}
        </section>
        <section className="dashboard-section">
          <h2>
            Technical Indicators
            {selectedCoin && ` — ${selectedCoin.name}`}
          </h2>

          {isLoadingAnalysis ? (
            <div className="placeholder-card">
              Loading technical analysis...
            </div>
          ) : analysisError ? (
            <div className="error-card" role="alert">
              {analysisError}
            </div>
          ) : analysis ? (
            <div className="indicator-grid">
              <div className="indicator-card">
                <span>RSI</span>
                <strong>{analysis.indicators.rsi.value ?? "—"}</strong>
                <small>{analysis.indicators.rsi.signal}</small>
              </div>

              <div className="indicator-card">
                <span>SMA</span>
                <strong>
                  {analysis.indicators.sma.value?.toLocaleString() ?? "—"}
                </strong>
                <small>{analysis.indicators.sma.signal}</small>
              </div>

              <div className="indicator-card">
                <span>EMA</span>
                <strong>
                  {analysis.indicators.ema.value?.toLocaleString() ?? "—"}
                </strong>
                <small>{analysis.indicators.ema.signal}</small>
              </div>

              <div className="indicator-card">
                <span>MACD</span>
                <strong>{analysis.indicators.macd.value ?? "—"}</strong>
                <small>{analysis.indicators.macd.trend}</small>

                <div className="macd-details">
                  <span>
                    Signal: {analysis.indicators.macd.signal_line ?? "—"}
                  </span>
                  <span>
                    Histogram: {analysis.indicators.macd.histogram ?? "—"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="placeholder-card">
              Select a coin to view its technical indicators.
            </div>
          )}
        </section>
        <section className="dashboard-section">
          <h2>
            Overall Analysis
            {selectedCoin && ` — ${selectedCoin.name}`}
          </h2>

          {isLoadingAnalysis ? (
            <div className="placeholder-card">Loading recommendation...</div>
          ) : analysisError ? (
            <div className="error-card" role="alert">
              {analysisError}
            </div>
          ) : analysis ? (
            <div className="analysis-summary">
              <div className="recommendation-card">
                <span>Recommendation</span>
                <strong>{analysis.overall.recommendation}</strong>
              </div>

              <div className="analysis-meta">
                <div>
                  <span>Score</span>
                  <strong>{analysis.overall.score}</strong>
                </div>

                <div>
                  <span>Strength</span>
                  <strong>{analysis.overall.strength}</strong>
                </div>
              </div>

              <div className="analysis-reasons">
                <span>Why?</span>

                <ul>
                  {analysis.overall.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="placeholder-card">
              Select a coin to view its overall analysis.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

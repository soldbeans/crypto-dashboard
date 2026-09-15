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

function App() {
  const [globalMarket, setGlobalMarket] = useState<GlobalMarket | null>(null);
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

  useEffect(() => {
    async function fetchGlobalMarket() {
      const response = await fetch("http://127.0.0.1:8000/global");
      const data = await response.json();

      setGlobalMarket(data);
    }

    fetchGlobalMarket();

    async function fetchTrending() {
      const response = await fetch("http://127.0.0.1:8000/trending");
      const data = await response.json();

      setTrending(data);
    }

    fetchTrending();

    async function fetchWatchlist() {
      const response = await fetch("http://127.0.0.1:8000/watchlist");
      const data = await response.json();

      setWatchlist(data);
      setIsLoadingWatchlist(false);
    }

    fetchWatchlist();

  }, []);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/search?query=${encodeURIComponent(searchQuery)}`
      );

      const data: SearchCoin[] = await response.json();

      setSearchResults(data);
    } finally {
      setIsSearching(false);
    }
  }

  async function addToWatchlist(coin: SearchCoin) {
  const response = await fetch("http://127.0.0.1:8000/watchlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      coin_id: coin.id,
    }),
  });

  if (!response.ok) {
    console.error("Failed to add coin to watchlist");
    return;
  }

  const watchlistResponse = await fetch(
    "http://127.0.0.1:8000/watchlist"
  );

  const updatedWatchlist: WatchlistCoin[] =
    await watchlistResponse.json();

  setWatchlist(updatedWatchlist);

}

async function loadCoinHistory(coin: SearchCoin) {
  setSelectedCoin(coin);
  setIsLoadingHistory(true);
  setIsLoadingAnalysis(true);
  setPriceHistory([]);
  setAnalysis(null);

  try {
    const [historyResponse, analysisResponse] = await Promise.all([
      fetch(`http://127.0.0.1:8000/coins/${coin.id}/history`),
      fetch(`http://127.0.0.1:8000/coins/${coin.id}/analysis`),
    ]);

    if (!historyResponse.ok) {
      throw new Error(
        `Failed to load price history: ${historyResponse.status}`
      );
    }

    if (!analysisResponse.ok) {
      throw new Error(
        `Failed to load analysis: ${analysisResponse.status}`
      );
    }

    const historyData: HistoryResponse = await historyResponse.json();
    const analysisData: AnalysisResponse = await analysisResponse.json();

    setPriceHistory(historyData.prices);
    setAnalysis(analysisData);
  } catch (error) {
    console.error("Failed to load coin data:", error);
    setPriceHistory([]);
    setAnalysis(null);
  } finally {
    setIsLoadingHistory(false);
    setIsLoadingAnalysis(false);
  }
}

  async function removeFromWatchlist(coinId: string) {
  const response = await fetch(
    `http://127.0.0.1:8000/watchlist/${coinId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    console.error("Failed to remove coin from watchlist");
    return;
  }

  setWatchlist((currentWatchlist) =>
    currentWatchlist.filter((coin) => coin.id !== coinId)
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

            <button type="submit">
              Search
            </button>
          </form>

          {isSearching && (
            <div className="placeholder-card">
              Searching...
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
                    className="watchlist-button"
                    onClick={() => addToWatchlist(coin)}
                  >
                    Add
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
        <section className="dashboard-section">
          <h2>Global Market</h2>

          {globalMarket ? (
            <div className="market-grid">
              <div className="market-card">
                <span>Total Market Cap</span>
                <strong>
                  ${globalMarket.market_cap_usd.toLocaleString()}
                </strong>
              </div>

              <div className="market-card">
                <span>24h Volume</span>
                <strong>
                  ${globalMarket.volume_24h_usd.toLocaleString()}
                </strong>
              </div>

              <div className="market-card">
                <span>BTC Dominance</span>
                <strong>
                  {globalMarket.btc_dominance.toFixed(2)}%
                </strong>
              </div>

              <div className="market-card">
                <span>ETH Dominance</span>
                <strong>
                  {globalMarket.eth_dominance.toFixed(2)}%
                </strong>
              </div>
            </div>
          ) : (
            <div className="placeholder-card">
              Loading global market data...
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Trending Coins</h2>

          {trending ? (
            <div className="trending-list">
              {trending.coins.slice(0, 5).map((coin) => (
                <div className="trending-coin" key={coin.id}>
                  <img src={coin.thumb} alt={coin.name} />

                  <div className="trending-info">
                    <strong>{coin.name}</strong>
                    <span>{coin.symbol}</span>
                  </div>

                  <span className="rank">
                    #{coin.market_cap_rank ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="placeholder-card">
              Loading trending coins...
            </div>
          )}
        </section>
        <section className="dashboard-section">
              <h2>Watchlist</h2>

              {isLoadingWatchlist ? (
                <div className="placeholder-card">
                  Loading watchlist...
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
                <div className="placeholder-card">
                  Your watchlist is empty.
                </div>
              )}
        </section>
        <section className="dashboard-section">
                        <h2>
                Historical Price
                {selectedCoin && ` — ${selectedCoin.name}`}
              </h2>

              {isLoadingHistory ? (
                <div className="placeholder-card">
                  Loading price history...
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

                      <Line
                        type="monotone"
                        dataKey="price"
                        dot={false}
                      />
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
            ) : analysis ? (
              <div className="indicator-grid">
                <div className="indicator-card">
                  <span>RSI</span>
                  <strong>
                    {analysis.indicators.rsi.value ?? "—"}
                  </strong>
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
                  <strong>
                    {analysis.indicators.macd.value ?? "—"}
                  </strong>
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
              <div className="placeholder-card">
                Loading recommendation...
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
import { useEffect, useState } from "react";
import "./App.css";

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

function App() {
  const [globalMarket, setGlobalMarket] = useState<GlobalMarket | null>(null);
  const [trending, setTrending] = useState<TrendingResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchCoin[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistCoin[]>([]);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(true);

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
                  </div>

                  <span>{coin.id}</span>
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

                      <div className="watchlist-price">
                        <strong>${coin.price.toLocaleString()}</strong>
                        <span>
                          {coin.change_24h >= 0 ? "+" : ""}
                          {coin.change_24h.toFixed(2)}%
                        </span>
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
      </main>
    </div>
  );
}

export default App;
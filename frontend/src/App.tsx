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

function App() {
  const [globalMarket, setGlobalMarket] = useState<GlobalMarket | null>(null);
  const [trending, setTrending] = useState<TrendingResponse | null>(null);

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

  }, []);

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
      </main>
    </div>
  );
}

export default App;
import "./App.css";

function App() {
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
          <div className="placeholder-card">
            Global market statistics will appear here.
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Trending Coins</h2>
          <div className="placeholder-card">
            Trending cryptocurrencies will appear here.
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Watchlist</h2>
          <div className="placeholder-card">
            Your saved cryptocurrencies will appear here.
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Market Analysis</h2>
          <div className="placeholder-card">
            RSI, SMA, EMA, MACD and BUY/HOLD/SELL signals will appear here.
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
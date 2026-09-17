export type GlobalMarketData = {
  market_cap_usd: number;
  volume_24h_usd: number;
  btc_dominance: number;
  eth_dominance: number;
  active_cryptocurrencies: number;
  markets: number;
  last_updated: number;
};

type GlobalMarketProps = {
  globalMarket: GlobalMarketData | null;
  globalError: string | null;
};

export default function GlobalMarket({
  globalMarket,
  globalError,
}: GlobalMarketProps) {
  return (
    <section className="dashboard-section">
      <h2>Global Market</h2>

      {globalError ? (
        <div className="error-card" role="alert">
          {globalError}
        </div>
      ) : globalMarket ? (
        <div className="market-grid">
          <div className="market-card">
            <span>Total Market Cap</span>
            <strong>${globalMarket.market_cap_usd.toLocaleString()}</strong>
          </div>

          <div className="market-card">
            <span>24h Volume</span>
            <strong>${globalMarket.volume_24h_usd.toLocaleString()}</strong>
          </div>

          <div className="market-card">
            <span>BTC Dominance</span>
            <strong>{globalMarket.btc_dominance.toFixed(2)}%</strong>
          </div>

          <div className="market-card">
            <span>ETH Dominance</span>
            <strong>{globalMarket.eth_dominance.toFixed(2)}%</strong>
          </div>
        </div>
      ) : (
        <div className="placeholder-card">
          Loading global market data...
        </div>
      )}
    </section>
  );
}
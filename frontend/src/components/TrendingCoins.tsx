
export type TrendingCoin = {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
};

export type TrendingResponse = {
  count: number;
  coins: TrendingCoin[];
};

type TrendingCoinsProps = {
  trending: TrendingResponse | null;
  trendingError: string | null;
};

export default function TrendingCoins({
  trending,
  trendingError,
}: TrendingCoinsProps) {
  return (
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
  );
}
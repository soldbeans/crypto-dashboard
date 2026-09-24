
export type WatchlistCoin = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  market_cap: number;
  change_24h: number;
  high_24h: number;
  low_24h: number;
};

type WatchlistProps = {
  watchlist: WatchlistCoin[];
  isLoadingWatchlist: boolean;
  watchlistError: string | null;
  pendingRemoveCoinId: string | null;
  onRemove: (coinId: string) => void;
  watchlistMessage: string | null;
  watchlistMessageType: "success" | "error" | null;
};

export default function Watchlist({
  watchlist,
  isLoadingWatchlist,
  watchlistError,
  watchlistMessage,
  watchlistMessageType,
  pendingRemoveCoinId,
  onRemove,
}: WatchlistProps) {
  return (
    <section className="dashboard-section">
      <h2>Watchlist</h2>

      {watchlistMessage && (
        <div
          className={
            watchlistMessageType === "error"
              ? "watchlist-message error"
              : "watchlist-message success"
          }
          role={watchlistMessageType === "error" ? "alert" : "status"}
        >
          {watchlistMessage}
        </div>
      )}

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
                  type="button"
                  className="remove-button"
                  disabled={pendingRemoveCoinId !== null}
                  onClick={() => onRemove(coin.id)}
                >
                  {pendingRemoveCoinId === coin.id ? "Removing..." : "Remove"}
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
  );
}

import type { FormEvent } from "react";

export type SearchCoin = {
  id: string;
  name: string;
  symbol: string;
};

type CoinSearchProps = {
  searchQuery: string;
  searchResults: SearchCoin[];
  isSearching: boolean;
  searchError: string | null;
  pendingCoinId: string | null;
  onQueryChange: (query: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onAdd: (coin: SearchCoin) => void;
  onView: (coin: SearchCoin) => void;
};

export default function CoinSearch({
  searchQuery,
  searchResults,
  isSearching,
  searchError,
  pendingCoinId,
  onQueryChange,
  onSearch,
  onAdd,
  onView,
}: CoinSearchProps) {
  return (
    <section className="dashboard-section">
      <h2>Coin Search</h2>

      <form className="search-form" onSubmit={onSearch}>
        <input
          type="text"
          placeholder="Search Bitcoin, Ethereum..."
          value={searchQuery}
          onChange={(event) => onQueryChange(event.target.value)}
        />

        <button type="submit">Search</button>
      </form>

      {isSearching && (
        <div className="placeholder-card">
          Searching...
        </div>
      )}

      {!isSearching && searchError && (
        <div className="error-card" role="alert">
          {searchError}
        </div>
      )}

      {!isSearching && !searchError && searchResults.length > 0 && (
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
                onClick={() => onAdd(coin)}
              >
                {pendingCoinId === coin.id ? "Adding..." : "Add"}
              </button>

              <button
                type="button"
                className="watchlist-button"
                onClick={() => onView(coin)}
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
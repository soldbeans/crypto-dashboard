import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type HistoryPoint = {
  timestamp: number;
  price: number;
};

type HistoricalPriceChartProps = {
  coinName: string | null;
  history: HistoryPoint[];
  isLoading: boolean;
  error: string | null;
};

export default function HistoricalPriceChart({
  coinName,
  history,
  isLoading,
  error,
}: HistoricalPriceChartProps) {
  const chartData = history.map((point) => ({
    ...point,
    date: new Date(point.timestamp).toLocaleDateString(),
  }));

  return (
    <section className="dashboard-section">
      <h2>
        Historical Price
        {coinName ? ` — ${coinName}` : ""}
      </h2>

      {isLoading ? (
        <div className="placeholder-card">
          Loading price history...
        </div>
      ) : error ? (
        <div className="error-card" role="alert">
          {error}
        </div>
      ) : history.length > 0 ? (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="date"
                minTickGap={30}
              />

              <YAxis
                domain={["auto", "auto"]}
                tickFormatter={(value: number) =>
                  `$${value.toLocaleString()}`
                }
              />

              <Tooltip
                formatter={(value) => [
                  `$${Number(value).toLocaleString()}`,
                  "Price",
                ]}
              />

              <Line
                type="monotone"
                dataKey="price"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : coinName ? (
        <div className="placeholder-card">
          No historical price data available.
        </div>
      ) : (
        <div className="placeholder-card">
          Select a coin to view its price history.
        </div>
      )}
    </section>
  );
}
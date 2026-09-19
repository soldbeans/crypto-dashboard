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

export type AnalysisResponse = {
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

type CoinAnalysisProps = {
  coinName: string | null;
  analysis: AnalysisResponse | null;
  isLoadingAnalysis: boolean;
  analysisError: string | null;
};

export default function CoinAnalysis({
  coinName,
  analysis,
  isLoadingAnalysis,
  analysisError,
}: CoinAnalysisProps) {
  return (
    <>
      <section className="dashboard-section">
        <h2>
          Technical Indicators
          {coinName && ` — ${coinName}`}
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
          {coinName && ` — ${coinName}`}
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
    </>
  );
}
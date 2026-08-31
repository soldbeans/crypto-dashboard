from pydantic import BaseModel


class RSIAnalysis(BaseModel):
    value: float | None
    signal: str


class SMAAnalysis(BaseModel):
    value: float | None
    signal: str


class EMAAnalysis(BaseModel):
    value: float | None
    signal: str


class MACDAnalysis(BaseModel):
    value: float | None
    signal_line: float | None
    histogram: float | None
    trend: str
    
    
class IndicatorsAnalysis(BaseModel):
    rsi: RSIAnalysis
    sma: SMAAnalysis
    ema: EMAAnalysis
    macd: MACDAnalysis


class OverallAnalysis(BaseModel):
    score: int
    recommendation: str
    strength: str
    reasons: list[str]


class AnalysisResponse(BaseModel):
    coin: str
    current_price: float
    indicators: IndicatorsAnalysis
    overall: OverallAnalysis


class AnalysisError(BaseModel):
    coin: str
    error: str
    required_data_points: int | None = None
    available_data_points: int | None = None


class ErrorResponse(BaseModel):
    detail: str
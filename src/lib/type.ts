export type Pair = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  precision: number;
};

export type ExchangeSymbol = {
  symbol: string;
  quoteAsset: string;
  status: string;
  filters: Array<{ filterType: string; tickSize: string }>;
};

export type ExchangeInfo = {
  symbols: ExchangeSymbol[];
};

export type Ticker24hr = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
};

export type SortField = "symbol" | "lastPrice" | "priceChangePercent";

export type Timeframe = {
  label: string;
  interval: string;
};

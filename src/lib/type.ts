export type Source = "binance" | "gate";
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

export type TradingViewWidgetOptions = {
  container_id: string | HTMLElement;
  width: string | number;
  height: string | number;
  symbol: string;
  interval: string;
  timezone: string;
  theme: string;
  style: string;
  locale: string;
  toolbar_bg: string;
  enable_publishing: boolean;
  hide_top_toolbar: boolean;
  hide_side_toolbar: boolean;
  save_image: boolean;
  overrides: Record<string, unknown>;
  studies: string[];
  studies_overrides: Record<string, unknown>;
};

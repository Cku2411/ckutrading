import { Timeframe } from "./type";

export const TIMEFRAMES: Timeframe[] = [
  { label: "1m", interval: "1" },
  { label: "5m", interval: "5" },
  { label: "15m", interval: "15" },
  { label: "30m", interval: "30" },
  { label: "1h", interval: "60" },
  { label: "4h", interval: "240" },
  { label: "1D", interval: "D" },
  { label: "1W", interval: "W" },
];

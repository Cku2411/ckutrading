import { Source } from "./type";

export function getDefaultSymbol(source: Source): string {
  return source === "binance" ? "BINANCE:BTCUSDT" : "GATEIO:BTCUSDT";
}

/**
 * Lấy prefix cho TradingView symbol
 */
export function getSymbolPrefix(source: Source) {
  return source === "binance" ? "BINANCE:" : "GATEIO:";
}

/**
 * Chuẩn hóa symbol cho TradingView (BTCUSDT, không có _ hoặc /)
 */
export function normalizeSymbol(symbolRaw: string) {
  return symbolRaw.replace(/[_/]/g, "").toUpperCase();
}

/**
 * Hiển thị symbol cho UI (BTC/USDT)
 */
export function displaySymbol(symbolRaw: string) {
  const symbolDisplay = normalizeSymbol(symbolRaw);
  if (symbolDisplay.endsWith("USDT")) {
    return symbolDisplay.replace(/(USDT)$/, "/$1");
  }
  return symbolDisplay;
}

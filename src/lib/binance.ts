import { getPrecision } from "./lib";
import { ExchangeInfo, Ticker24hr } from "./type";

export async function getBinancePairs() {
  // 1. Lấy exchangeInfo

  const info: ExchangeInfo = await fetch(
    "https://api.binance.com/api/v3/exchangeInfo"
  ).then((r) => r.json());
  // 2. Lấy 24h stats

  const stats: Ticker24hr[] = await fetch(
    "https://api.binance.com/api/v3/ticker/24hr"
  ).then((r) => r.json());

  // 3. Lọc cặp USDT đang trading và build map symbol → tickSize

  const usdtSymbols = info.symbols.filter(
    (s) => s.quoteAsset === "USDT" && s.status === "TRADING"
  );

  const tickSizeMap = usdtSymbols.reduce<Record<string, string>>((acc, s) => {
    const priceFilter = s.filters.find((f) => f.filterType === "PRICE_FILTER");
    acc[s.symbol] = priceFilter?.tickSize || "1";
    return acc;
  }, {});

  const usdtSet = new Set(usdtSymbols.map((s) => s.symbol));

  // 4. Map stats thành pairsData kèm precision

  return stats
    .filter((t) => usdtSet.has(t.symbol))
    .map((t) => ({
      symbol: t.symbol,
      lastPrice: t.lastPrice,
      priceChangePercent: t.priceChangePercent,
      precision: getPrecision(tickSizeMap[t.symbol]),
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}

import { Pair } from "@/lib/type";

interface GateTicker {
  currency_pair: string;
  last: string;
  change_percentage: string;
}

interface GateMeta {
  id: string;
  precision: number;
}

/**
 * Lấy ticker + precision từ API nội bộ (proxy)
 */
export async function getGatePairs(): Promise<Pair[]> {
  const res = await fetch("/api/gate-pairs");
  if (!res.ok) throw new Error("Failed to fetch gate pairs");
  const { tickers, metas }: { tickers: GateTicker[]; metas: GateMeta[] } =
    await res.json();

  const precisionMap = Object.fromEntries(
    metas.map((m) => [m.id, m.precision])
  );

  return tickers
    .filter((ticker) => ticker.currency_pair.endsWith("_USDT"))
    .map((ticker) => {
      const id = ticker.currency_pair;
      return {
        symbol: id.replace("_", "/").toUpperCase(),
        lastPrice: ticker.last,
        priceChangePercent: ticker.change_percentage,
        precision: precisionMap[id] ?? 4,
      };
    })
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}

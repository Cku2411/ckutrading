import { useEffect, useState } from "react";
import { getBinancePairs } from "@/lib/binance";
import { getGatePairs } from "@/lib/gate";
import { Pair, Source } from "@/lib/type";

export function usePairs(source: Source) {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchPairs = async () => {
      try {
        const data =
          source === "binance" ? await getBinancePairs() : await getGatePairs();
        if (!cancelled) setPairs(data);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error
              ? err.message
              : String(err) || "Lỗi tải dữ liệu cặp giao dịch"
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPairs();
    return () => {
      cancelled = true;
    };
  }, [source]);

  return { pairs, loading, error };
}

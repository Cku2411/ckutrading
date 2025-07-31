import { useEffect } from "react";
import { Source, Pair } from "./type";
import { getSymbolPrefix, normalizeSymbol } from "./symbol";

interface NavigationOptions {
  source: Source;
  filteredPairs: Pair[];
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  setCurrentPrice: (price: string) => void;
  setAlertValue: (val: string) => void;
}

function formatSymbol(source: Source, rawSymbol: string): string {
  return getSymbolPrefix(source) + normalizeSymbol(rawSymbol);
}

export function useGlobalArrowNavigation({
  source,
  filteredPairs,
  currentSymbol,
  onSelectSymbol,
  setCurrentPrice,
  setAlertValue,
}: NavigationOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (filteredPairs.length === 0) return;

      const isTypingInInput =
        document.activeElement &&
        (document.activeElement as HTMLElement).tagName === "INPUT";

      if (isTypingInInput) return;

      const currentIndex = filteredPairs.findIndex((pair) => {
        const formatted = formatSymbol(source, pair.symbol);
        return formatted === currentSymbol;
      });

      let nextIndex = currentIndex;

      if (e.key === "ArrowDown") {
        nextIndex =
          currentIndex < filteredPairs.length - 1 ? currentIndex + 1 : 0;
      } else if (e.key === "ArrowUp") {
        nextIndex =
          currentIndex > 0 ? currentIndex - 1 : filteredPairs.length - 1;
      } else {
        return;
      }

      const nextPair = filteredPairs[nextIndex];

      if (!nextPair) return;

      const nextSymbol = formatSymbol(source, nextPair.symbol);
      onSelectSymbol(nextSymbol);
      setCurrentPrice((+nextPair.lastPrice).toFixed(nextPair.precision));
      setAlertValue("");

      setTimeout(() => {
        const pairElement = document.getElementById(`pair-${nextPair.symbol}`);
        const listContainer = document.getElementById("pairList");

        if (pairElement && listContainer) {
          const pairRect = pairElement.getBoundingClientRect();
          const containerRect = listContainer.getBoundingClientRect();

          const isOutOfView =
            pairRect.top < containerRect.top ||
            pairRect.bottom > containerRect.bottom;

          if (isOutOfView) {
            pairElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
      }, 50);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredPairs, currentSymbol, source]);
}

export function useTradingTitle(symbol: string, price: string, source: Source) {
  useEffect(() => {
    const cleanSymbol = symbol.replace(/^(BINANCE:|GATEIO:)/, "");
    const title = price
      ? `${cleanSymbol} @ ${price} | Trading Alerts`
      : `${cleanSymbol} | Trading Alerts`;
    document.title = title;
  }, [symbol, price, source]);
}

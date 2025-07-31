import React from "react";
import { getSymbolPrefix, normalizeSymbol, displaySymbol } from "@/lib/symbol";

interface PairListProps {
  filteredPairs: Array<{
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
    precision: number;
  }>;
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  setCurrentPrice: (price: string) => void;
  setAlertValue: (v: string) => void;
  source: "binance" | "gate";
}

const PairList: React.FC<PairListProps> = ({
  filteredPairs,
  currentSymbol,
  onSelectSymbol,
  setCurrentPrice,
  setAlertValue,
  source,
}) => (
  <div id="pairList" className="flex-1 overflow-y-auto">
    {filteredPairs.length === 0 ? (
      <div className="text-center text-[#888] py-8">Không tìm thấy cặp nào</div>
    ) : (
      filteredPairs.map((pair) => {
        // xu ly symbol tu api
        const symbol = getSymbolPrefix(source) + normalizeSymbol(pair.symbol);
        return (
          <div
            key={pair.symbol}
            id={`pair-${pair.symbol}`}
            className={`pair grid grid-cols-[2fr_1fr_1fr_auto] items-center px-4 py-2 text-[13px] border-b border-[#2a2e38] cursor-pointer transition text-center ${
              symbol === currentSymbol ? "bg-[#243447]" : "hover:bg-[#2a2e38]"
            }`}
            onClick={() => {
              onSelectSymbol(symbol);
              setCurrentPrice((+pair.lastPrice).toFixed(pair.precision));
              setAlertValue("");
            }}
          >
            <span className="symbol truncate text-left whitespace-nowrap overflow-hidden">
              {displaySymbol(pair.symbol)}
            </span>
            <span className="price text-right whitespace-nowrap overflow-hidden">
              {(+pair.lastPrice).toFixed(pair.precision)}
            </span>
            <span
              className={`change text-right whitespace-nowrap ${
                +pair.priceChangePercent >= 0
                  ? "text-[#4caf50]"
                  : "text-[#f44336]"
              }`}
            >
              {(+pair.priceChangePercent).toFixed(2)}%
            </span>
            <a
              href={`https://www.tradingview.com/chart/?symbol=${symbol}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-[#007acc] hover:text-[#005fa3] flex items-center"
              title="Xem biểu đồ TradingView"
              onClick={(e) => e.stopPropagation()}
            >
              🔗
            </a>
          </div>
        );
      })
    )}
  </div>
);

export default PairList;

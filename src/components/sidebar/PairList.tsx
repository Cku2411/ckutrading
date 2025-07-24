import React from "react";

interface PairListProps {
  filtered: Array<{
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
    precision: number;
  }>;
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  setCurrentPrice: (price: string) => void;
  setAlertValue: (v: string) => void;
}

const PairList: React.FC<PairListProps> = ({
  filtered,
  currentSymbol,
  onSelectSymbol,
  setCurrentPrice,
  setAlertValue,
}) => (
  <div id="pairList" className="flex-1 overflow-y-auto">
    {filtered.length === 0 ? (
      <div className="text-center text-[#888] py-8">Không tìm thấy cặp nào</div>
    ) : (
      filtered.map((t) => {
        const symbol = `BINANCE:${t.symbol}`;
        return (
          <div
            key={t.symbol}
            className={`pair grid grid-cols-[2fr_1fr_1fr_auto] items-center px-4 py-2 text-[13px] border-b border-[#2a2e38] cursor-pointer transition text-center ${
              symbol === currentSymbol ? "bg-[#243447]" : "hover:bg-[#2a2e38]"
            }`}
            onClick={() => {
              onSelectSymbol(symbol);
              setCurrentPrice((+t.lastPrice).toFixed(t.precision));
              setAlertValue("");
            }}
          >
            <span className="symbol truncate text-left whitespace-nowrap overflow-hidden">
              {t.symbol.replace("USDT", "/USDT")}
            </span>
            <span className="price text-right whitespace-nowrap overflow-hidden">
              {(+t.lastPrice).toFixed(t.precision)}
            </span>
            <span
              className={`change text-right whitespace-nowrap ${
                +t.priceChangePercent >= 0 ? "text-[#4caf50]" : "text-[#f44336]"
              }`}
            >
              {(+t.priceChangePercent).toFixed(2)}%
            </span>
            {/* <span></span> */}
            <a
              href={`https://www.tradingview.com/chart/?symbol=BINANCE:${t.symbol}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-[#007acc] hover:text-[#005fa3] flex items-center"
              title="Xem biểu đồ TradingView"
              onClick={(e) => e.stopPropagation()} // Để không trigger chọn cặp khi bấm link
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

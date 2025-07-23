"use client";

import ChartContainer from "@/components/ChartContainer";
import Sidebar from "@/components/Sidebar";

import { useState, useEffect } from "react";

export default function Home() {
  const [symbol, setSymbol] = useState<string>("");
  const [interval, setInterval] = useState<string>("15");
  const [currentPrice, setCurrentPrice] = useState<string>("");
  const defaultSymbol = "BINANCE:BTCUSDT";

  useEffect(() => {
    const cleanSymbol = symbol.replace("BINANCE:", "");
    if (currentPrice) {
      document.title = `${cleanSymbol} @ ${currentPrice} | Trading Alerts`;
    } else {
      document.title = `${cleanSymbol} | Trading Alerts`;
    }
  }, [symbol, currentPrice]);

  return (
    <main className="w-full h-screen bg-[#111] text-white font-sans">
      <div className="flex h-screen">
        <ChartContainer symbol={symbol || defaultSymbol} interval={interval} />
        <Sidebar
          onSelectSymbol={setSymbol}
          onSelectTimeframe={setInterval}
          currentSymbol={symbol || defaultSymbol}
          currentTimeframe={interval}
        />
      </div>
    </main>
  );
}

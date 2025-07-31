"use client";

import { useState, useEffect } from "react";
import ChartContainer from "@/components/ChartContainer";
import Sidebar from "@/components/Sidebar";

import { Source } from "@/lib/type";
import { getDefaultSymbol } from "@/lib/symbol";

export default function Home() {
  const [source, setSource] = useState<Source>("binance");
  const [symbol, setSymbol] = useState<string>("");
  const [interval, setInterval] = useState<string>("15");

  // Đặt defaultSymbol theo source
  const defaultSymbol = getDefaultSymbol(source);

  useEffect(() => {
    const cleanSymbol = symbol.replace(/^(BINANCE:|GATEIO:)/, "");
    document.title = `${cleanSymbol} | Trading Alerts`;
  }, [symbol, source]);

  return (
    <main className="w-full h-screen bg-[#111] text-white font-sans">
      <div className="flex h-screen">
        <ChartContainer symbol={symbol || defaultSymbol} interval={interval} />
        <Sidebar
          onSelectSymbol={setSymbol}
          onSelectTimeframe={setInterval}
          currentSymbol={symbol || defaultSymbol}
          currentTimeframe={interval}
          source={source}
          setSource={setSource}
        />
      </div>
    </main>
  );
}

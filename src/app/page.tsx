"use client";

import Image from "next/image";
import ChartContainer from "@/components/ChartContainer";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function Home() {
  const [symbol, setSymbol] = useState<string>("");
  const [interval, setInterval] = useState<string>("15");
  const defaultSymbol = "BINANCE:BTCUSDT";

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

"use client";

import React, { useEffect, useState, useTransition } from "react";
import { createAlertAction } from "@/app/actions/alert";
import {
  Pair,
  ExchangeInfo,
  Ticker24hr,
  SortField,
  Timeframe,
} from "@/lib/type";
import SidebarTabs from "./sidebar/SidebarTabs";
import TimeframeSelector from "./sidebar/TimeframeSelector";
import PairSearchBox from "./sidebar/PairSearchBox";
import AlertButton from "./sidebar/AlertButton";
import PairList from "./sidebar/PairList";
import AlertSettingsTab from "./sidebar/AlertSettingsTab";

const TIMEFRAMES: Timeframe[] = [
  { label: "1m", interval: "1" },
  { label: "5m", interval: "5" },
  { label: "15m", interval: "15" },
  { label: "30m", interval: "30" },
  { label: "1h", interval: "60" },
  { label: "4h", interval: "240" },
  { label: "1D", interval: "D" },
  { label: "1W", interval: "W" },
];

interface SidebarProps {
  onSelectSymbol: (symbol: string) => void;
  onSelectTimeframe: (interval: string) => void;
  currentSymbol: string;
  currentTimeframe: string;
}

const Sidebar = ({
  onSelectSymbol,
  onSelectTimeframe,
  currentSymbol,
  currentTimeframe,
}: SidebarProps) => {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState("");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("symbol");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState<"trading" | "alerts">("trading");
  const [alertValue, setAlertValue] = useState("");
  const [, start] = useTransition();
  const [alertPopup, setAlertPopup] = useState<{
    symbol: string;
    currentPrice: number;
  } | null>(null);
  const [reloading, setReloading] = useState(false);

  // ===
  console.log({ currentPrice });

  // Lưu alert khi click Save
  async function onSaveAlert() {
    if (!currentSymbol) {
      alert("Chưa chọn cặp để tạo alert");
      return;
    }

    console.log({ alertValue });

    const target = parseFloat(alertValue.trim());

    // if (!isNaN(target)) {
    //   alert("Vui lòng nhập giá hợp lệ!");
    //   return;
    // }

    // // Lấy giá hiện tại từ DOM hoặc props (nếu bạn lưu lastPrice)
    // const currentPriceEl = document.querySelector<HTMLSpanElement>(
    //   ".pair.active .price"
    // );
    // const currentPrice = currentPriceEl
    //   ? parseFloat(currentPriceEl.textContent || "")
    //   : NaN;

    // if (isNaN(currentPrice)) {
    //   alert("Không lấy được giá hiện tại");
    //   return;
    // }

    // Xác định direction
    const direction = target >= parseFloat(currentPrice) ? "ABOVE" : "BELOW";
    console.log({ target, currentPrice });

    start(async () => {
      try {
        // Nếu dùng import: await createAlertAction(...)
        // Nếu bạn truyền qua props: await createAlert(currentSymbol, target, direction)
        await createAlertAction(currentSymbol, target, direction);

        alert(`✅ Alert created: ${currentSymbol} ${direction} ${target}`);
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
          alert("❌ Lỗi khi tạo alert: " + err.message);
        } else {
          alert("❌ Lỗi khi tạo alert không xác định");
        }
      }
    });
  }

  function getPrecision(tickSize: string) {
    const dec = tickSize.split(".")[1] || "";
    const idx = dec.indexOf("1");
    return idx >= 0 ? idx + 1 : 0;
  }
  // Refactor loadPairs ra ngoài useEffect để có thể gọi lại
  async function loadPairs() {
    setLoading(true);
    setReloading(true);
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
      const priceFilter = s.filters.find(
        (f) => f.filterType === "PRICE_FILTER"
      );
      acc[s.symbol] = priceFilter?.tickSize || "1";
      return acc;
    }, {});
    const usdtSet = new Set(usdtSymbols.map((s) => s.symbol));
    // 4. Map stats thành pairsData kèm precision
    const pairsData = stats
      .filter((t) => usdtSet.has(t.symbol))
      .map((t) => ({
        symbol: t.symbol,
        lastPrice: t.lastPrice,
        priceChangePercent: t.priceChangePercent,
        precision: getPrecision(tickSizeMap[t.symbol]),
      }))
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
    setPairs(pairsData);
    setLoading(false);
    setReloading(false);
  }

  useEffect(() => {
    loadPairs();
  }, []);

  // Filter, sort
  const filtered = pairs
    .filter((t) => t.symbol.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const va: string | number =
        sortField === "symbol" ? a.symbol : +a[sortField];
      const vb: string | number =
        sortField === "symbol" ? b.symbol : +b[sortField];
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  // Lắng nghe phím arrow up/down ở toàn bộ Sidebar
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (filtered.length === 0) return;
      if (
        document.activeElement &&
        (document.activeElement as HTMLElement).tagName === "INPUT"
      )
        return;
      const idx = filtered.findIndex(
        (t) => `BINANCE:${t.symbol}` === currentSymbol
      );
      if (e.key === "ArrowDown") {
        const next = idx < filtered.length - 1 ? idx + 1 : 0;
        const t = filtered[next];
        if (t) {
          onSelectSymbol(`BINANCE:${t.symbol}`);
          setCurrentPrice((+t.lastPrice).toFixed(t.precision));
          setAlertValue("");
        }
      } else if (e.key === "ArrowUp") {
        const prev = idx > 0 ? idx - 1 : filtered.length - 1;
        const t = filtered[prev];
        if (t) {
          onSelectSymbol(`BINANCE:${t.symbol}`);
          setCurrentPrice((+t.lastPrice).toFixed(t.precision));
          setAlertValue("");
        }
      }
    }
    const sidebar = document.getElementById("sidebar-root");
    if (sidebar) sidebar.addEventListener("keydown", handleKeyDown);
    return () => {
      if (sidebar) sidebar.removeEventListener("keydown", handleKeyDown);
    };
  }, [filtered, currentSymbol]);

  // Đóng popup khi click ra ngoài
  useEffect(() => {
    const close = () => setAlertPopup(null);
    if (alertPopup) {
      window.addEventListener("click", close);
      return () => window.removeEventListener("click", close);
    }
  }, [alertPopup]);

  return (
    <aside
      id="sidebar-root"
      tabIndex={0}
      className="w-[300px] bg-[#1b1f27] border-l border-[#333] flex flex-col overflow-hidden h-full focus:outline-none"
    >
      {/* Tiêu đề */}
      <div className="flex items-center p-4 text-[14px] uppercase tracking-wider border-b border-[#333]">
        <span id="sidebar-title" className="flex-1">
          Cặp USDT (Binance): {pairs.length}
        </span>
        <button
          className={`ml-2 p-1 rounded transition ${
            reloading ? "animate-spin opacity-60" : "hover:bg-[#222]"
          }`}
          title="Reload pairs"
          onClick={loadPairs}
          disabled={reloading}
          style={{ lineHeight: 0 }}
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke={reloading ? "#4caf50" : "#4caf50"}
            style={{ transition: "stroke 0.2s" }}
            className="reload-svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582M20 20v-5h-.581M5.062 19A9 9 0 1021 12.003"
            />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <SidebarTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab: Trading */}
      <div
        id="trading"
        className={`tab-content ${
          activeTab === "trading" ? "flex" : "hidden"
        } flex-col flex-1 overflow-hidden`}
      >
        {/* Timeframes */}
        <TimeframeSelector
          timeframes={TIMEFRAMES}
          currentTimeframe={currentTimeframe}
          onSelectTimeframe={onSelectTimeframe}
        />
        {/* Search box + AlertButton */}
        <PairSearchBox search={search} setSearch={setSearch}>
          <AlertButton
            currentSymbol={currentSymbol}
            currentPrice={currentPrice}
            alertValue={alertValue}
            setAlertValue={setAlertValue}
            onSaveAlert={onSaveAlert}
          />
        </PairSearchBox>
        {/* Header row */}
        <div
          id="pairHeader"
          className="grid grid-cols-[2fr_1fr_1fr_auto] px-4 py-2 text-[12px] text-[#aaa] border-b border-[#333] text-center"
        >
          <span
            data-sort="symbol"
            className={`text-left col-span-1 cursor-pointer select-none ${
              sortField === "symbol"
                ? sortDir === "asc"
                  ? "sort-asc"
                  : "sort-desc"
                : ""
            }`}
            onClick={() => {
              if (sortField === "symbol")
                setSortDir(sortDir === "asc" ? "desc" : "asc");
              else {
                setSortField("symbol");
                setSortDir("asc");
              }
            }}
          >
            Pair
          </span>
          <span
            data-sort="lastPrice"
            className={`cursor-pointer select-none ${
              sortField === "lastPrice"
                ? sortDir === "asc"
                  ? "sort-asc"
                  : "sort-desc"
                : ""
            }`}
            onClick={() => {
              if (sortField === "lastPrice")
                setSortDir(sortDir === "asc" ? "desc" : "asc");
              else {
                setSortField("lastPrice");
                setSortDir("asc");
              }
            }}
          >
            Price
          </span>
          <span
            data-sort="priceChangePercent"
            className={`cursor-pointer select-none ${
              sortField === "priceChangePercent"
                ? sortDir === "asc"
                  ? "sort-asc"
                  : "sort-desc"
                : ""
            }`}
            onClick={() => {
              if (sortField === "priceChangePercent")
                setSortDir(sortDir === "asc" ? "desc" : "asc");
              else {
                setSortField("priceChangePercent");
                setSortDir("asc");
              }
            }}
          >
            24h %
          </span>
          <span></span>
        </div>
        {/* Pair list */}
        <PairList
          filtered={filtered}
          currentSymbol={currentSymbol}
          onSelectSymbol={onSelectSymbol}
          setCurrentPrice={setCurrentPrice}
          setAlertValue={setAlertValue}
        />
      </div>

      {/* Tab: Alert Settings */}
      {activeTab === "alerts" && <AlertSettingsTab />}
      <style jsx global>{`
        #pairHeader span.sort-asc::after {
          content: " ▲";
          font-size: 10px;
        }
        #pairHeader span.sort-desc::after {
          content: " ▼";
          font-size: 10px;
        }
        .reload-svg:hover {
          stroke: #81c784 !important;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;

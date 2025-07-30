"use client";

import React, { useEffect, useState, useTransition } from "react";
import { TfiReload } from "react-icons/tfi";
import { getBinancePairs } from "@/lib/binance";
import { getGatePairs } from "@/lib/gate";
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
import { toast } from "sonner";

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
  source: "binance" | "gate";
  setSource: (s: "binance" | "gate") => void;
}

const Sidebar = ({
  onSelectSymbol,
  onSelectTimeframe,
  currentSymbol,
  currentTimeframe,
  source,
  setSource,
}: SidebarProps) => {
  const [pairs, setPairs] = useState<Pair[]>([]);
  // const [source, setSource] = useState<"binance" | "gate">("binance");
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

  async function onSaveAlert() {
    if (!currentSymbol) {
      toast.error("🚫 Vui lòng chọn cặp để tạo alert");
      return;
    }

    const target = parseFloat(alertValue.trim());

    if (isNaN(target)) {
      toast.error("⛔️ Vui lòng nhập giá hợp lệ!");
      return;
    }

    if (!currentPrice || isNaN(parseFloat(currentPrice))) {
      toast.error("⚠️ Không lấy được giá hiện tại");
      return;
    }

    const direction = target >= parseFloat(currentPrice) ? "ABOVE" : "BELOW";

    start(async () => {
      try {
        await createAlertAction(currentSymbol, target, direction);

        toast.success(`✅ Đã tạo alert cho ${currentSymbol}`, {
          description: `${
            direction === "ABOVE" ? "Khi tăng vượt" : "Khi giảm dưới"
          } ${target}`,
        });

        setAlertValue(""); // optional: reset sau khi tạo
      } catch (err: unknown) {
        console.error("❌ Lỗi tạo alert", err);

        const msg =
          err instanceof Error
            ? err.message
            : "Lỗi không xác định khi tạo alert";

        toast.error("🚫 Không thể tạo alert", {
          description: msg,
        });
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

    const pairsData =
      source === "gate" ? await getGatePairs() : await getBinancePairs();

    // source === "binance" ? await getBinancePairs() : await getGatePairs();

    console.log({ source });
    console.log({ pairsData });

    setPairs(pairsData);
    setLoading(false);
    setReloading(false);
  }

  useEffect(() => {
    loadPairs();
    // Reset search khi đổi sàn
    setSearch("");
  }, [source]);

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

  // Xử lý chọn cặp
  function handleSelectPair(pair: Pair) {
    const prefix = source === "binance" ? "BINANCE:" : "GATEIO:";
    onSelectSymbol(`${prefix}${pair.symbol}`);
    setCurrentPrice((+pair.lastPrice).toFixed(pair.precision));
    setAlertValue("");
  }

  // Lắng nghe phím arrow up/down ở toàn bộ Sidebar
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (filtered.length === 0) return;

      // Nếu đang nhập thì không xử lý
      if (
        document.activeElement &&
        (document.activeElement as HTMLElement).tagName === "INPUT"
      )
        return;

      const idx = filtered.findIndex(
        (t) =>
          (source === "binance"
            ? `BINANCE:${t.symbol}`
            : `GATEIO:${t.symbol}`) === currentSymbol
      );

      let nextIdx = idx;

      if (e.key === "ArrowDown") {
        nextIdx = idx < filtered.length - 1 ? idx + 1 : 0;
      } else if (e.key === "ArrowUp") {
        nextIdx = idx > 0 ? idx - 1 : filtered.length - 1;
      } else {
        return;
      }

      const targetPair = filtered[nextIdx];
      if (targetPair) {
        const nextSymbol = `BINANCE:${targetPair.symbol}`;
        onSelectSymbol(nextSymbol);
        setCurrentPrice((+targetPair.lastPrice).toFixed(targetPair.precision));
        setAlertValue("");

        // ✅ Scroll nếu phần tử nằm ngoài vùng hiển thị
        setTimeout(() => {
          const el = document.getElementById(`pair-${targetPair.symbol}`);
          const container = document.getElementById("pairList");
          if (el && container) {
            const elRect = el.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            const isOutOfView =
              elRect.top < containerRect.top ||
              elRect.bottom > containerRect.bottom;

            if (isOutOfView) {
              el.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }
        }, 50);
      }
    }

    const sidebar = document.getElementById("sidebar-root");
    if (sidebar) sidebar.addEventListener("keydown", handleKeyDown);
    return () => {
      if (sidebar) sidebar.removeEventListener("keydown", handleKeyDown);
    };
  }, [filtered, currentSymbol, source]);

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
          Cặp USDT ({source}): {pairs.length}
        </span>

        <select
          value={source}
          onChange={(e) => setSource(e.target.value as "binance" | "gate")}
          className="mb-2 p-1 bg-[#1b1f27] text-white"
        >
          <option value="binance">Binance</option>
          <option value="gate">Gate.io</option>
        </select>

        <button
          className={`ml-2 p-1 rounded transition ${
            reloading ? "animate-spin opacity-60" : "hover:bg-[#222]"
          }`}
          title="Reload pairs"
          onClick={loadPairs}
          disabled={reloading}
          style={{ lineHeight: 0 }}
        >
          <TfiReload size={20} />
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
          source={source}
        />
      </div>

      {/* Tab: Alert Settings */}
      {activeTab === "alerts" && (
        <AlertSettingsTab onSelectSymbol={onSelectSymbol} />
      )}

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

"use client";

import React, { useCallback, useEffect, useState, useTransition } from "react";
import { TfiReload } from "react-icons/tfi";
import { getBinancePairs } from "@/lib/binance";
import { getGatePairs } from "@/lib/gate";
import { createAlertAction } from "@/app/actions/alert";
import { TIMEFRAMES } from "@/lib/constant";
import { useGlobalArrowNavigation } from "@/lib/hooks";
import { Pair, SortField, Source } from "@/lib/type";
import { toast } from "sonner";

import SidebarTabs from "./sidebar/SidebarTabs";
import TimeframeSelector from "./sidebar/TimeframeSelector";
import PairSearchBox from "./sidebar/PairSearchBox";
import AlertButton from "./sidebar/AlertButton";
import PairList from "./sidebar/PairList";
import AlertSettingsTab from "./sidebar/AlertSettingsTab";
import { Menu } from "lucide-react";

interface SidebarProps {
  onSelectSymbol: (symbol: string) => void;
  onSelectTimeframe: (interval: string) => void;
  currentSymbol: string;
  currentTimeframe: string;
  source: Source;
  setSource: (source: Source) => void;
}

const Sidebar = ({
  onSelectSymbol,
  onSelectTimeframe,
  currentSymbol,
  currentTimeframe,
  source,
  setSource,
}: SidebarProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pairs, setPairs] = useState<Pair[]>([]);
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

  // Refactor loadPairs ra ngoài useEffect để có thể gọi lại
  const loadPairs = useCallback(async () => {
    setReloading(true);
    const pairsData =
      source === "gate" ? await getGatePairs() : await getBinancePairs();
    setPairs(pairsData);
    setReloading(false);
  }, [source]);

  useEffect(() => {
    loadPairs();
    // Reset search khi đổi sàn
    setSearch("");
  }, [source]);

  // Filter, sort pair
  const filteredPairs = pairs
    .filter((pair) => pair.symbol.toLowerCase().includes(search.toLowerCase()))
    .sort((pairA, pairB) => {
      const valueA: string | number =
        sortField === "symbol" ? pairA.symbol : +pairA[sortField];
      const valueB: string | number =
        sortField === "symbol" ? pairB.symbol : +pairB[sortField];

      if (valueA < valueB) return sortDir === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  // Lắng nghe phím arrow up/down ở toàn bộ Sidebar
  useGlobalArrowNavigation({
    source,
    filteredPairs,
    currentSymbol,
    onSelectSymbol,
    setCurrentPrice,
    setAlertValue,
  });

  // Đóng popup khi click ra ngoài
  useEffect(() => {
    const close = () => setAlertPopup(null);
    if (alertPopup) {
      window.addEventListener("click", close);
      return () => window.removeEventListener("click", close);
    }
  }, [alertPopup]);

  return (
    <>
      <button
        className="md:hidden p-2 bg-gray-700 text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu />
      </button>
      <aside
        id="sidebar-root"
        tabIndex={0}
        className={`w-[300px] bg-[#1b1f27] border-l border-[#333] flex-col overflow-hidden h-full focus:outline-none
        ${sidebarOpen ? "flex" : "hidden"} md:flex`}
      >
        {/* Tiêu đề */}
        <div className="flex items-center p-4 text-[14px] uppercase tracking-wider border-b border-[#333]">
          <span id="sidebar-title" className="flex-1">
            Cặp USDT ({source}): {pairs.length}
          </span>

          <select
            value={source}
            onChange={(e) => setSource(e.target.value as Source)}
            className="mb-2 p-1 bg-[#1b1f27] text-white hover:bg-[#333]"
          >
            <option value="binance">Binance</option>
            <option value="gate">Gate.io</option>
          </select>

          <button
            className={`ml-2 p-1 rounded transition ${
              reloading ? "animate-spin opacity-60" : "hover:bg-[#333]"
            }`}
            title="Reload pairs"
            onClick={loadPairs}
            disabled={reloading}
            style={{ lineHeight: 0 }}
          >
            <TfiReload size={20} className="text-yellow-400 " />
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
            filteredPairs={filteredPairs}
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
    </>
  );
};

export default Sidebar;

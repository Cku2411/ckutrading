import React from "react";
import { Timeframe } from "@/lib/type";

interface TimeframeSelectorProps {
  timeframes: Timeframe[];
  currentTimeframe: string;
  onSelectTimeframe: (interval: string) => void;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  timeframes,
  currentTimeframe,
  onSelectTimeframe,
}) => (
  <div
    id="timeframes"
    className="flex flex-wrap px-4 py-2 gap-1 border-b border-[#333]"
  >
    {timeframes.map((timeframe) => (
      <button
        key={timeframe.interval}
        className={`w-[40px] text-center px-2 py-1 text-[12px] rounded hover:bg-[#333] text-white transition ${
          currentTimeframe === timeframe.interval
            ? "bg-[#007acc]"
            : "bg-[#2a2e38]"
        }`}
        onClick={() => onSelectTimeframe(timeframe.interval)}
      >
        {timeframe.label}
      </button>
    ))}
  </div>
);

export default TimeframeSelector;

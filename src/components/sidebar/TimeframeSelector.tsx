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
    {timeframes.map((tf) => (
      <div
        key={tf.interval}
        className={`timeframe px-2 py-1 text-[12px] rounded cursor-pointer text-white transition ${
          currentTimeframe === tf.interval ? "bg-[#007acc]" : "bg-[#2a2e38]"
        }`}
        onClick={() => onSelectTimeframe(tf.interval)}
      >
        {tf.label}
      </div>
    ))}
  </div>
);

export default TimeframeSelector;

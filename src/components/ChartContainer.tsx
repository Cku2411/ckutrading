"use client";
import React, { useEffect, useState } from "react";
import { TradingViewWidgetOptions } from "@/lib/type";

declare global {
  interface Window {
    TradingView?: {
      widget: (opts: TradingViewWidgetOptions) => void;
    };
  }
}

interface ChartContainerProps {
  symbol: string;
  interval: string;
}

const ChartContainer = ({ symbol, interval }: ChartContainerProps) => {
  const [tvReady, setTvReady] = useState(false);
  useEffect(() => {
    if (window.TradingView) setTvReady(true);
    else {
      const handler = () => setTvReady(true);
      window.addEventListener("tradingview:ready", handler);
      return () => window.removeEventListener("tradingview:ready", handler);
    }
  }, []);

  useEffect(() => {
    if (!symbol || !tvReady || !window.TradingView) return;
    const containerId = "tv_chart_container";
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = "";
    // @ts-expect-error: TradingView.widget không có type chính thức
    new window.TradingView.widget({
      container_id: containerId,
      width: "100%",
      height: "100%",
      symbol,
      interval,
      timezone: "Asia/Ho_Chi_Minh",
      theme: "dark",
      style: "1",
      locale: "vi",
      toolbar_bg: "#1b1f27",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      save_image: false,
      overrides: {
        "paneProperties.background": "rgba(0,0,0,1)",
        "paneProperties.gridProperties.color": "#363c4e",
        "legendProperties.showVolume": false,
        "paneProperties.volumePaneSize": 0,
        "mainSeriesProperties.candleStyle.upColor": "rgba(34,171,148,0)",
        "mainSeriesProperties.candleStyle.downColor": "rgba(5,102,86,1)",
        "mainSeriesProperties.candleStyle.borderUpColor": "rgba(5,102,86,1)",
        "mainSeriesProperties.candleStyle.borderDownColor": "rgba(5,102,86,1)",
        "mainSeriesProperties.candleStyle.wickUpColor": "rgba(5,102,86,1)",
        "mainSeriesProperties.candleStyle.wickDownColor": "rgba(5,102,86,1)",
      },
    });
    return () => {
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = "";
    };
  }, [symbol, interval, tvReady]);

  useEffect(() => {
    if (window.TradingView) return;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      const event = new Event("tradingview:ready");
      window.dispatchEvent(event);
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="flex-1 h-full">
      <div id="tv_chart_container" className="w-full h-full" />
    </div>
  );
};

export default ChartContainer;

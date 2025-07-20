import React from "react";

interface SidebarTabsProps {
  activeTab: "trading" | "alerts";
  setActiveTab: (tab: "trading" | "alerts") => void;
}

const SidebarTabs: React.FC<SidebarTabsProps> = ({
  activeTab,
  setActiveTab,
}) => (
  <div id="sidebar-tabs" className="flex select-none">
    <div
      className={`tab flex-1 text-center py-2 cursor-pointer text-[13px] ${
        activeTab === "trading"
          ? "bg-[#111] text-white border-b-2 border-[#007acc]"
          : "text-[#aaa] bg-[#1b1f27] border-b border-[#333]"
      }`}
      data-tab="trading"
      onClick={() => setActiveTab("trading")}
    >
      Trading
    </div>
    <div
      className={`tab flex-1 text-center py-2 cursor-pointer text-[13px] ${
        activeTab === "alerts"
          ? "bg-[#111] text-white border-b-2 border-[#007acc]"
          : "text-[#aaa] bg-[#1b1f27] border-b border-[#333]"
      }`}
      data-tab="alerts"
      onClick={() => setActiveTab("alerts")}
    >
      Alert Settings
    </div>
  </div>
);

export default SidebarTabs;

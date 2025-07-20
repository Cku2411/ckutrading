import React from "react";

interface PairSearchBoxProps {
  search: string;
  setSearch: (v: string) => void;
  children?: React.ReactNode;
}

const PairSearchBox: React.FC<PairSearchBoxProps> = ({
  search,
  setSearch,
  children,
}) => (
  <div className="flex items-center gap-2 my-2 mx-4">
    <input
      id="pairSearch"
      type="text"
      placeholder="Search pairs..."
      className="flex-1 px-2 py-2 rounded bg-[#2a2e38] text-white text-[13px] border-none outline-none placeholder:text-[#888]"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    {children}
  </div>
);

export default PairSearchBox;

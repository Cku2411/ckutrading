import React, { useState } from "react";

interface AlertButtonProps {
  currentSymbol: string;
  currentPrice: string;
  alertValue: string;
  setAlertValue: (v: string) => void;
  onSaveAlert: () => void;
}

const AlertButton: React.FC<AlertButtonProps> = ({
  currentSymbol,
  currentPrice,
  alertValue,
  setAlertValue,
  onSaveAlert,
}) => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <span
      className="alert-icon text-[18px] text-[#bbb] cursor-pointer relative flex items-center justify-end"
      title="Set Alert"
    >
      <span
        onClick={() => setShowPopup((v) => !v)}
        className="flex items-center"
      >
        🔔
      </span>
      {/* Popup */}
      <div
        className={`alert-popup absolute top-full right-0 w-[180px] bg-[#1b1f27] border border-[#333] p-2 rounded z-10 shadow-lg ${
          showPopup ? "block" : "hidden"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xs text-[#aaa] mb-1">
          {currentSymbol ? (
            <>
              <span>{currentSymbol}</span>
              {currentPrice && (
                <span className="ml-2 text-[#4caf50]">{currentPrice}</span>
              )}
            </>
          ) : (
            <span>Chọn cặp trước</span>
          )}
        </div>
        <input
          type="text"
          placeholder="Nhập giá cảnh báo"
          className="w-full px-2 py-1 rounded bg-[#2a2e38] text-white text-[13px] border-none outline-none"
          value={alertValue}
          onChange={(e) => setAlertValue(e.target.value)}
        />
        <button
          className="mt-2 w-full py-1 bg-[#007acc] rounded text-white text-[13px] transition hover:bg-[#005fa3] cursor-pointer"
          onClick={onSaveAlert}
        >
          Save
        </button>
      </div>
    </span>
  );
};

export default AlertButton;

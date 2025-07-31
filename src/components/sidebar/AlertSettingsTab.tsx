"use client";

import React, { useEffect, useState, useTransition } from "react";
import { getActiveAlertsAction, deleteAlertAction } from "@/app/actions/alert";
import { FiX } from "react-icons/fi";

type Alert = {
  id: number;
  symbol: string;
  direction: "ABOVE" | "BELOW";
  targetPrice: number;
};

interface Props {
  onSelectSymbol: (symbol: string) => void;
}

const AlertSettingsTab: React.FC<Props> = ({ onSelectSymbol }) => {
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  async function reloadAlerts() {
    const res = await getActiveAlertsAction();
    setAlerts(res);
    setLoading(false);
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      await deleteAlertAction(id);
      await reloadAlerts();
    });
  }

  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await getActiveAlertsAction();
        setAlerts(res);
      } catch (err) {
        console.error("❌ Failed to load alerts", err);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, []);

  if (loading) {
    return (
      <div className="tab-content flex p-4">
        <p className="text-gray-500">Đang tải cảnh báo…</p>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="tab-content flex p-4">
        <p className="text-[#888]">
          Chưa có cảnh báo nào.
          <br />
          (Sẽ load từ database)
        </p>
      </div>
    );
  }

  return (
    <div
      id="alerts"
      className="tab-content flex flex-col gap-3 p-4 overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-[#2a2e38] scrollbar-track-[#1b1f27]"
    >
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-center justify-between p-4 border rounded-md  hover:bg-[#2a2e38] bg-[#1b1f27] "
        >
          <div
            className="cursor-pointer"
            onClick={() => onSelectSymbol(`${alert.symbol}`)}
          >
            <p className="text-lg font-medium">{alert.symbol}</p>
            <p className="text-sm text-gray-600">
              {alert.direction === "ABOVE"
                ? "Tăng lên trên"
                : "Giảm xuống dưới"}{" "}
              <span className="font-semibold">{alert.targetPrice}</span>
            </p>
          </div>

          {/* Nút X để xóa */}
          <button
            onClick={() => handleDelete(alert.id)}
            title="Xóa cảnh báo"
            className="ml-4 p-2 text-red-500 hover:text-red-700 cursor-pointer"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertSettingsTab;

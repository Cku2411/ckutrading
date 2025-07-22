import React from "react";

const AlertSettingsTab: React.FC = () => (
  <div id="alerts" className="tab-content flex">
    <p className="p-4 text-[#888]">
      Chưa có cảnh báo nào.
      <br />
      (Sẽ load từ database)
    </p>
  </div>
);

export default AlertSettingsTab;

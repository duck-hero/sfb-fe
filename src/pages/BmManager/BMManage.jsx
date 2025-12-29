import { useState } from "react";
import BmAccountList from "../BmAccountManage/BmAccountList";
import BmSourceList from "../BmSourceManage/BmSourceList";
import AdsAccountList from "../AdsAccountManage/AdsAccountList";
import MonthlySourceStats from "../BmSourceManage/MonthlySourceStats";
import ThresholdStats from "../AdsAccountManage/ThresholdStats";
import { UserCog, Database, Megaphone, BarChart3, BadgeCent } from "lucide-react";

export default function BMManage() {
  const [activeTab, setActiveTab] = useState("adsAcc");

  const tabs = [
    {
      key: "adsAcc",
      label: "Tài khoản quảng cáo",
      icon: <Megaphone className="w-4 h-4" />,
    },
    {
      key: "account",
      label: "BM Gốc",
      icon: <UserCog className="w-4 h-4" />,
    },
    {
      key: "source",
      label: "Nguồn BM",
      icon: <Database className="w-4 h-4" />,
    },
    {
      key: "stats",
      label: "Thống kê nguồn (đầu tổng)",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      key: "threshold",
      label: "Ngưỡng",
      icon: <BadgeCent className="w-4 h-4" />,
    },
  ];

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4 ">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all cursor-pointer
              ${
                activeTab === t.key
                  ? "border-primary-darkest text-primary-darkest"
                  : "border-transparent text-gray-600 hover:text-black"
              }
            `}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === "adsAcc" && <AdsAccountList />}
        {activeTab === "account" && <BmAccountList />}
        {activeTab === "source" && <BmSourceList />}
        {activeTab === "stats" && <MonthlySourceStats />}
        {activeTab === "threshold" && <ThresholdStats />}
      </div>
    </div>
  );
}

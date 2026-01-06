import { useState } from "react";
import { CreditCard, BarChart, PieChart } from "lucide-react";
import BankCardStatistics from "./components/BankCardStatistics";

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState("card_stats");

  const tabs = [
    {
      key: "card_stats",
      label: "Thống kê thẻ",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      key: "stats_2",
      label: "Thống kê 2",
      icon: <BarChart className="w-4 h-4" />,
    },
    {
      key: "stats_3",
      label: "Thống kê 3",
      icon: <PieChart className="w-4 h-4" />,
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
        {activeTab === "card_stats" && <BankCardStatistics />}
        {activeTab === "stats_2" && (
          <div className="p-4 text-gray-500">Đang phát triển...</div>
        )}
        {activeTab === "stats_3" && (
          <div className="p-4 text-gray-500">Đang phát triển...</div>
        )}
      </div>
    </div>
  );
}

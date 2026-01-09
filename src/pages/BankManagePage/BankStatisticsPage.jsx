import { useState } from "react";
import { BadgeCent, History } from "lucide-react";
import BankCardStatistics from "../Statistics/components/BankCardStatistics";
import TransactionStatistics from "../TransactionManage/TransactionStatistics";

export default function BankStatisticsPage() {
  const [activeTab, setActiveTab] = useState("card-stats");

  const tabs = [
    {
      key: "card-stats",
      label: "Thống kê thẻ",
      icon: <BadgeCent className="w-4 h-4" />,
    },
    {
      key: "trans-stats",
      label: "TK giao dịch",
      icon: <History className="w-4 h-4" />,
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
        {activeTab === "card-stats" && <BankCardStatistics />}
        {activeTab === "trans-stats" && <TransactionStatistics />}
      </div>
    </div>
  );
}

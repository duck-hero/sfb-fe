import { useState } from "react";
import { FileUser , Database, CreditCard, Landmark, BadgeCent, History } from "lucide-react";
import BankCardList from "../BankCardManage/BankCardList";
import BankAccountList from "../BankAccountManage/BankAccountList";
import BankList from "../BankManage/BankList";
import BankCardStatistics from "../Statistics/components/BankCardStatistics";
import TransactionStatistics from "../TransactionManage/TransactionStatistics";

export default function BankManagePage() {
  const [activeTab, setActiveTab] = useState("cards");

  const tabs = [
    {
      key: "cards",
      label: "Thẻ ngân hàng",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      key: "account",
      label: "Tài khoản ngân hàng",
      icon: <FileUser  className="w-4 h-4" />,
    },
    {
      key: "bank",
      label: "Ngân hàng",
      icon: <Landmark className="w-4 h-4" />,
    },
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
        {activeTab === "cards" && <BankCardList />}
        {activeTab === "account" && <BankAccountList />}
        {activeTab === "bank" && <BankList />}
        {activeTab === "card-stats" && <BankCardStatistics />}
        {activeTab === "trans-stats" && <TransactionStatistics />}
      </div>
    </div>
  );
}

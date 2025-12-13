import React, { useState } from "react";
import { Megaphone, ArrowLeftRight, BadgeDollarSign } from "lucide-react";

import TransactionHistoryList from "../TransactionHistoryManage/TransactionHistoryList";
import FinancialTransactionList from "./FinancialTransactionList";

export default function TransactionManage() {
  const [activeTab, setActiveTab] = useState("fbSpend");

  const tabs = [
    {
      key: "fbSpend",
      label: "Tài khoản chi tiêu FB",
      icon: <Megaphone className="w-4 h-4" />,
    },
    {
      key: "financial",
      label: "Giao dịch thu chi",
      icon: <ArrowLeftRight className="w-4 h-4" />,
    },
    {
      key: "profit",
      label: "Giao dịch tài khoản lợi nhuận",
      icon: <BadgeDollarSign className="w-4 h-4" />,
    },
  ];

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
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
        {activeTab === "fbSpend" && (
          <TransactionHistoryList bankAccountType={1} />
        )}
        {activeTab === "financial" && (
          <FinancialTransactionList bankAccountType={2} />
        )}
        {activeTab === "profit" && <FinancialTransactionList bankAccountType={3} />}
      </div>
    </div>
  );
}



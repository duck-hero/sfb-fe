import React, { useState } from "react";
import { FileUser , Database, CreditCard, Landmark } from "lucide-react";
import BmAccountList from "../BmAccountManage/BmAccountList";
import BmSourceList from "../BmSourceManage/BmSourceList";
import AdsAccountList from "../AdsAccountManage/AdsAccountList";
import BankCardList from "../BankCardManage/bankCardList";
import BankAccountList from "../BankAccountManage/BankAccountList";
import BankList from "../BankManage/BankList";

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
      </div>
    </div>
  );
}

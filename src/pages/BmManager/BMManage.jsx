import React, { useState } from "react";
import { UserCog , Database } from "lucide-react";
import BmAccountList from "../BmAccountManage/BmAccountList";
import BmSourceList from "../BmSourceManage/BmSourceList";




export default function BMManage() {
  const [activeTab, setActiveTab] = useState("account");

  const tabs = [
    {
      key: "account",
      label: "BM",
      icon: <UserCog  className="w-4 h-4" />,
    },
    {
      key: "source",
      label: "Nguồn BM",
      icon: <Database className="w-4 h-4" />,
    },
  ];

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all 
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
        {activeTab === "account" && <BmAccountList />}
        {activeTab === "source" && <BmSourceList />}
      </div>
    </div>
  );
}

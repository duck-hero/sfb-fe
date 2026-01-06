import { useState } from "react";
import { Users, FileSpreadsheet, FileBox } from "lucide-react";
import CustomerList from "./CustomerList";
import MonthlyCustomerReconciliation from "./MonthlyCustomerReconciliation";
import CustomerGroupList from "./CustomerGroupList";
import AdAccountAuditReport from "./AdAccountAuditReport";

export default function CustomerManagementPage() {
  const [activeTab, setActiveTab] = useState("list");

  const tabs = [
    {
      key: "list",
      label: "Danh sách khách hàng",
      icon: <Users className="w-4 h-4" />,
    },
    {
      key: "group",
      label: "Nhóm",
      icon: <Users className="w-4 h-4 text-blue-500" />,
    },
    {
      key: "reconciliation",
      label: "Tổng hợp công nợ",
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
    {
      key: "audit",
      label: "BC đối soát",
      icon: <FileBox className="w-4 h-4" />,
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
        {activeTab === "list" && <CustomerList />}
        {activeTab === "group" && <CustomerGroupList />}
        {activeTab === "reconciliation" && (
          <MonthlyCustomerReconciliation />
        )}
        {activeTab === "audit" && <AdAccountAuditReport />}
      </div>
    </div>
  );
}

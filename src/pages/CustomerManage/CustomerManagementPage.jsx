import { useState } from "react";
import { Users, FileSpreadsheet, BarChart3, PieChart } from "lucide-react";
import CustomerList from "./CustomerList";
import MonthlyCustomerReconciliation from "./MonthlyCustomerReconciliation";

export default function CustomerManagementPage() {
  const [activeTab, setActiveTab] = useState("list");

  const tabs = [
    {
      key: "list",
      label: "Danh sách khách hàng",
      icon: <Users className="w-4 h-4" />,
    },
    {
      key: "reconciliation",
      label: "Tổng hợp công nợ",
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
    {
      key: "audit",
      label: "BC đối soát",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      key: "profit",
      label: "Lợi Nhuận Phí",
      icon: <PieChart className="w-4 h-4" />,
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
      <div className="min-h-[600px]">
        {activeTab === "list" && <CustomerList />}
        {activeTab === "reconciliation" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
             <MonthlyCustomerReconciliation />
          </div>
        )}
        {(activeTab === "audit" || activeTab === "profit") && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
            <div className="flex flex-col items-center gap-3">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                  {activeTab === "audit" ? <BarChart3 className="w-8 h-8 text-gray-300" /> : <PieChart className="w-8 h-8 text-gray-300" />}
               </div>
               <h3 className="text-lg font-medium text-gray-900">Tính năng đang phát triển</h3>
               <p className="text-gray-500 max-w-sm mx-auto">
                 Chúng tôi đang nỗ lực hoàn thiện chức năng "{tabs.find(t => t.key === activeTab)?.label}". Vui lòng quay lại sau.
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import dashboardApi from "../../api/dashboardApi";
import dayjs from "dayjs";
import { Loader2, Calendar, HandCoins, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";

/**
 * Page: Thống kê chi phí
 */
const ExpenseAccountingSummary = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getExpenseAccountingSummary(year, month);
      if (response && response.success) {
        setData(response.data);
      } else {
        setData(null);
      }
    } catch (error) {
      console.error("Failed to fetch expense summary:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, month]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Calculate totals
  const totalDebit = data?.rows?.reduce((sum, item) => sum + (item.debitAmount || 0), 0) || 0;
  const totalCredit = data?.rows?.reduce((sum, item) => sum + (item.creditAmount || 0), 0) || 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-50 p-2 rounded-lg">
            <HandCoins className="text-red-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              Thống kê chi phí
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Báo cáo chi tiết các khoản chi phí trong tháng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors border border-transparent hover:border-gray-200"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white rounded-md transition-all shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2 px-3">
              <Calendar size={16} className="text-gray-500" />
              <span className="font-semibold text-sm">
                Tháng {month}/{year}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white rounded-md transition-all shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="flex justify-center items-center h-64 flex-1">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : !data || !data.rows || data.rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 flex-1">
          <AlertCircle className="w-12 h-12 mb-2 opacity-20" />
          <p>Không có dữ liệu chi phí cho tháng này</p>
        </div>
      ) : (
        <div className="overflow-auto flex-1 relative custom-scrollbar">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-200 min-w-[200px]">
                  Đối tượng
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 border-b border-gray-200">
                  Nợ (Debit)
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 border-b border-gray-200">
                  Có (Credit)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.rows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 border-b border-gray-100 font-medium text-gray-900">
                    {row.accountingObject}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-right font-medium text-red-600">
                    {new Intl.NumberFormat('vi-VN').format(row.debitAmount)}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-right font-medium text-green-600">
                    {new Intl.NumberFormat('vi-VN').format(row.creditAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Footer Totals */}
            <tfoot className="bg-gray-50 sticky bottom-0 z-20 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] font-bold text-gray-900">
              <tr>
                <td className="px-4 py-3 border-t border-gray-200 text-left uppercase text-gray-600">
                  Tổng cộng
                </td>
                <td className="px-4 py-3 border-t border-gray-200 text-right text-red-700">
                  {new Intl.NumberFormat('vi-VN').format(totalDebit)}
                </td>
                <td className="px-4 py-3 border-t border-gray-200 text-right text-green-700">
                  {new Intl.NumberFormat('vi-VN').format(totalCredit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpenseAccountingSummary;

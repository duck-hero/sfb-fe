import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Calendar, RotateCw, Filter, Download } from "lucide-react";
import dashboardApi from "../../api/dashboardApi";
import { toast } from "react-toastify";

const FeeProfitMatrix = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    year: dayjs().year(),
    month: dayjs().month() + 1,
  });

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getDailyFeeProfitMatrix(filters.year, filters.month);
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch profit matrix", error);
      toast.error("Không thể tải bảng lợi nhuận phí");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, [filters]);

  const handlePrevMonth = () => {
    setFilters(prev => {
      let newMonth = prev.month - 1;
      let newYear = prev.year;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
      return { year: newYear, month: newMonth };
    });
  };

  const handleNextMonth = () => {
    setFilters(prev => {
      let newMonth = prev.month + 1;
      let newYear = prev.year;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
      return { year: newYear, month: newMonth };
    });
  };

  const formatCurrency = (amount) => {
    if (amount === 0) return "-";
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat('vi-VN', { style: 'decimal', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="p-6 flex flex-col h-full space-y-4">
      {/* Header & Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Ma trận Lợi nhuận phí</h1>
          <p className="text-sm text-gray-500">Thống kê lợi nhuận phí chi tiết theo ngày</p>
        </div>

        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-inner">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500 hover:text-blue-600"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 px-4 font-bold text-gray-700 min-w-[140px] justify-center text-sm">
            <Calendar size={16} className="text-blue-500" />
            Tháng {filters.month}, {filters.year}
          </div>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500 hover:text-blue-600"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <button
          onClick={fetchMatrix}
          disabled={loading}
          className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
          title="Làm mới"
        >
          <RotateCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Matrix Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-3">
            <RotateCw size={40} className="text-blue-500 animate-spin" />
            <p className="text-gray-400 font-medium animate-pulse">Đang xử lý dữ liệu...</p>
          </div>
        ) : !data || !data.rows || data.rows.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-gray-400 italic">
            Không có dữ liệu cho tháng này
          </div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-30">
                <tr className="bg-gray-50/80 backdrop-blur-sm">
                  <th className="sticky left-0 z-40 min-w-[180px] px-2 py-2 text-left text-[10px] font-bold text-gray-500 uppercase border-b border-r border-gray-100 bg-gray-50/90">CODE KHÁCH</th>
                  <th className="sticky left-[180px] z-40 w-[100px] px-2 py-2 text-right text-[10px] font-bold text-blue-600 uppercase border-b border-r border-gray-100 bg-gray-50/90 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">Tổng LN</th>
                  
                  {Array.from({ length: (data.daysInMonth || 0) }, (_, i) => i + 1).map(day => (
                    <th key={day} className="min-w-[70px] px-1 py-2 text-center text-[10px] font-semibold text-gray-600 border-b border-r border-gray-100">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.rows.map((row) => (
                  <tr key={row.customerId} className="hover:bg-blue-50 transition-colors group">
                    <td className="sticky left-0 z-20 px-2 py-1.5 text-xs font-semibold text-gray-800 border-r border-gray-50 bg-white group-hover:bg-blue-50 truncate" title={row.fullCustomerCode}>{row.fullCustomerCode}</td>
                    <td className={`sticky left-[180px] z-20 px-2 py-1.5 text-xs font-black border-r border-gray-50 bg-white group-hover:bg-blue-50 shadow-[2px_0_5px_rgba(0,0,0,0.02)] text-right ${row.rowTotalProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {formatCurrency(row.rowTotalProfit)}
                    </td>
                    
                    {Array.from({ length: (data.daysInMonth || 0) }, (_, i) => i + 1).map(day => {
                        const cell = row.cells ? row.cells[day.toString()] : null;
                        const profit = cell?.profit || 0;
                        return (
                          <td key={day} className={`px-1 py-1.5 text-[11px] text-right font-mono border-r border-gray-50 ${profit > 0 ? 'text-gray-900 font-medium' : profit < 0 ? 'text-red-600 bg-red-50/20' : 'text-gray-300'}`}>
                            {formatCurrency(profit)}
                          </td>
                        );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 z-30">
                <tr className="bg-gray-100/95 backdrop-blur-sm font-black">
                  <td className="sticky left-0 z-40 px-2 py-2 text-xs uppercase text-gray-600 border-t border-r border-gray-200 bg-gray-100 truncate">Tổng ngày</td>
                  <td className="sticky left-[180px] z-40 px-2 py-2 text-xs text-right text-blue-900 bg-blue-50 border-t border-r border-gray-200 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                    {formatCurrency(data.monthlySummary?.totalProfit || 0)}
                  </td>
                  
                  {Array.from({ length: (data.daysInMonth || 0) }, (_, i) => i + 1).map(day => {
                    const total = data.dailyTotals ? (data.dailyTotals[day.toString()] || 0) : 0;
                    return (
                        <td key={day} className={`px-1 py-2 text-xs text-right font-mono border-t border-r border-gray-200 ${total >= 0 ? 'text-green-700 font-bold' : 'text-red-700 bg-red-50/50 font-bold'}`}>
                        {formatCurrency(total)}
                        </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Custom scrollbar for better density */
        .overflow-auto::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .overflow-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .overflow-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}} />
    </div>
  );
};

export default FeeProfitMatrix;

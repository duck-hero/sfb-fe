import React, { useState, useEffect } from "react";
import { Loader2, Calendar, FileText } from "lucide-react";
import bmSourceApi from "../../api/bmSourceApi";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const MonthlySourceStats = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(12);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await bmSourceApi.getMonthlyStats(year, month);
      if (response.success) {
        setData(response.data);
      } else {
        toast.error(response.message || "Không thể tải dữ liệu thống kê");
      }
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
      toast.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [year, month]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "-";
    return num.toLocaleString("vi-VN");
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-darkest" />
          Thống kê đầu tổng tháng {month}/{year}
        </h2>
        
        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select 
              value={month} 
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div>
            <select 
              value={year} 
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium cursor-pointer"
            >
              {Array.from({ length: 3 }, (_, i) => dayjs().year() - i).map(y => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-darkest" />
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-xl scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700 bg-gray-50 sticky left-0 z-20 border-r whitespace-nowrap min-w-[200px]">
                  Tên Nguồn BM
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-right bg-blue-50 border-r whitespace-nowrap min-w-[120px]">
                  Tổng chi tiêu
                </th>
                {daysArray.map(day => (
                  <th key={day} className="px-3 py-3 font-semibold text-gray-700 text-center min-w-[100px] border-r">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data && data.sources.length > 0 ? (
                data.sources.map((source) => (
                  <tr key={source.sourceId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      {source.sourceName}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-blue-700 bg-blue-50 border-r">
                      {formatNumber(source.totalSpend)}
                    </td>
                    {daysArray.map(day => {
                      const dailyVal = source.dailyStats[day.toString()];
                      return (
                        <td key={day} className={`px-3 py-3 text-center border-r ${dailyVal > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                          {dailyVal ? formatNumber(dailyVal) : "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={daysInMonth + 2} className="px-4 py-10 text-center text-gray-500 bg-gray-50 italic">
                    Không có dữ liệu cho tháng này
                  </td>
                </tr>
              )}
            </tbody>
            {data && data.sources.length > 0 && (
              <tfoot className="bg-gray-100 font-bold border-t-2">
                <tr>
                  <td className="px-4 py-3 sticky left-0 bg-gray-100 z-10 border-r uppercase tracking-wider">
                    Tổng kết tháng
                  </td>
                  <td className="px-4 py-3 text-right text-primary-darkest border-r">
                    {formatNumber(data.grandTotalSpend)}
                  </td>
                  {daysArray.map(day => {
                    const dayTotal = data.sources.reduce((sum, source) => {
                      return sum + (source.dailyStats[day.toString()] || 0);
                    }, 0);
                    return (
                      <td key={day} className="px-3 py-3 text-center border-r text-gray-800">
                        {dayTotal > 0 ? formatNumber(dayTotal) : "-"}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
};

export default MonthlySourceStats;

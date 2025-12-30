import React, { useState, useEffect } from "react";
import { Loader2, Calendar, FileText, ChevronRight, ChevronDown } from "lucide-react";
import bmSourceApi from "../../api/bmSourceApi";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const MonthlySourceStats = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(12);

  // States for expandable rows
  const [expandedSources, setExpandedSources] = useState(new Set());
  const [reconciliationData, setReconciliationData] = useState({});
  const [loadingReconciliation, setLoadingReconciliation] = useState(new Set());

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

  const toggleSource = async (sourceId) => {
    const isExpanded = expandedSources.has(sourceId);
    
    setExpandedSources(prev => {
      const next = new Set(prev);
      if (isExpanded) {
        next.delete(sourceId);
      } else {
        next.add(sourceId);
      }
      return next;
    });

    if (!isExpanded && !reconciliationData[sourceId] && !loadingReconciliation.has(sourceId)) {
      setLoadingReconciliation(prev => new Set(prev).add(sourceId));
      try {
        const response = await bmSourceApi.getReconciliation(sourceId, year, month);
        if (response.success) {
          setReconciliationData(prev => ({
            ...prev,
            [sourceId]: response.data
          }));
        }
      } catch (error) {
        console.error("Error fetching reconciliation:", error);
        toast.error("Không thể tải chi tiết đối soát");
      } finally {
        setLoadingReconciliation(prev => {
          const next = new Set(prev);
          next.delete(sourceId);
          return next;
        });
      }
    }
  };

  useEffect(() => {
    fetchStats();
    // Clear expanded states when month/year changes
    setExpandedSources(new Set());
    setReconciliationData({});
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
                <th className="px-4 py-3 font-semibold text-gray-700 bg-gray-50 sticky left-0 z-20 border-r whitespace-nowrap min-w-[250px]">
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
                data.sources.map((source) => {
                  const isExpanded = expandedSources.has(source.sourceId);
                  const isLoading = loadingReconciliation.has(source.sourceId);
                  const reconData = reconciliationData[source.sourceId];

                  return (
                    <React.Fragment key={source.sourceId}>
                      <tr 
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50/20' : ''}`}
                        onClick={() => toggleSource(source.sourceId)}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-inherit z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                            {source.sourceName}
                            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-primary-darkest" />}
                          </div>
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

                      {/* Display Reconciliation Details */}
                      {isExpanded && reconData && reconData.bmDetails && reconData.bmDetails.map((bm) => (
                        <React.Fragment key={`bm-${bm.bmId}`}>
                          <tr className="bg-gray-50/50">
                            <td className="px-4 py-2 pl-10 font-medium text-gray-700 sticky left-0 bg-gray-50 z-10 border-r border-b first-letter:uppercase">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                {bm.bmName}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right font-semibold text-blue-600 bg-blue-50/30 border-r border-b">
                              {formatNumber(bm.totalSpend)}
                            </td>
                            {daysArray.map(day => (
                              <td key={`bm-day-${day}`} className="px-3 py-2 text-center border-r border-b text-gray-400">
                                -
                              </td>
                            ))}
                          </tr>
                          
                          {/* Ad Account Details */}
                          {bm.adAccountDetails && bm.adAccountDetails.map((acc) => (
                            <tr key={`acc-${acc.adAccountId}`} className="bg-white">
                              <td className="px-4 py-1.5 pl-16 text-xs text-gray-500 sticky left-0 bg-white z-10 border-r border-b">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-gray-700">{acc.adAccountName}</span>
                                  <span className="text-[10px]">{acc.adAccountIdNumber}</span>
                                </div>
                              </td>
                              <td className="px-4 py-1.5 text-right text-xs font-medium text-gray-600 bg-gray-50/20 border-r border-b">
                                {formatNumber(acc.totalSpend)}
                              </td>
                              {daysArray.map(day => (
                                <td key={`acc-day-${day}`} className="px-3 py-1.5 text-center border-r border-b text-gray-300">
                                  -
                                </td>
                              ))}
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}

                      {/* Loading state for individual source if needed but already covered by the icon */}
                      {isExpanded && isLoading && (
                        <tr>
                          <td colSpan={daysInMonth + 2} className="px-4 py-4 text-center">
                            <div className="flex justify-center items-center gap-2 text-gray-400 text-xs">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Đang tải dữ liệu chi tiết...
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
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

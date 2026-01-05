import React, { useState, useEffect } from "react";
import { Loader2, Calendar, FileText, TrendingUp, CreditCard, RefreshCw } from "lucide-react";
import bmSourceApi from "../../api/bmSourceApi";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import SourceDetailModal from "./SourceDetailModal";

const MonthlySourceStats = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  
  // Modal State
  const [selectedSource, setSelectedSource] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await bmSourceApi.getReconciliationSummary(year, month);
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

  const handleRowClick = (source) => {
    setSelectedSource(source);
    setDetailModalOpen(true);
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "-";
    return num.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
  };

  const formatCurrency = (amount) => {
     if (amount === undefined || amount === null) return "-";
     return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  // Calculate totals for footer
  const totals = data.reduce((acc, curr) => ({
      openingBalance: acc.openingBalance + (curr.openingBalance || 0),
      totalAds: acc.totalAds + (curr.totalAds || 0),
      totalFee: acc.totalFee + (curr.totalFee || 0),
      totalAdsPlusFee: acc.totalAdsPlusFee + (curr.totalAdsPlusFee || 0),
      totalThreshold: acc.totalThreshold + (curr.totalThreshold || 0),
      manualDiscount: acc.manualDiscount + (curr.manualDiscount || 0),
      paid: acc.paid + (curr.paid || 0),
      currentDebt: acc.currentDebt + (curr.currentDebt || 0)
  }), {
      openingBalance: 0,
      totalAds: 0,
      totalFee: 0,
      totalAdsPlusFee: 0,
      totalThreshold: 0,
      manualDiscount: 0,
      paid: 0,
      currentDebt: 0
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <FileText className="w-6 h-6 text-blue-600" />
          Tổng hợp công nợ đầu tổng tháng {month}/{year}
        </h2>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchStats}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors border border-transparent hover:border-gray-200"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 px-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select 
                value={month} 
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-700 cursor-pointer outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
            </div>
            <div className="h-5 w-px bg-gray-300"></div>
            <div className="px-2">
              <select 
                value={year} 
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-700 cursor-pointer outline-none"
              >
                {Array.from({ length: 3 }, (_, i) => dayjs().year() - i).map(y => (
                  <option key={y} value={y}>Năm {y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 flex-1">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-xl shadow-sm flex-1 scrollbar-thin scrollbar-thumb-gray-200">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#f8f9fa] text-gray-700 sticky top-0 z-20">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-600 border-b border-r min-w-[200px]">Nguồn BM</th>
                <th className="px-4 py-4 font-bold text-gray-600 border-b border-r text-right min-w-[140px]">
                  <div>Dư đầu kỳ</div>
                  <div className="text-[10px] font-normal text-gray-400">(Nợ tháng trước)</div>
                </th>
                <th className="px-4 py-4 font-bold text-gray-600 border-b border-r text-right min-w-[140px]">
                  <div>Tổng Ads</div>
                  <div className="text-[10px] font-normal text-gray-400">(Tổng chi tiêu)</div>
                </th>
                <th className="px-4 py-4 font-bold text-gray-600 border-b border-r text-right min-w-[120px]">
                  <div>Tổng Phí</div>
                  <div className="text-[10px] font-normal text-gray-400">(Ads x % phí)</div>
                </th>
                <th className="px-4 py-4 font-bold text-blue-700 border-b border-r text-right bg-blue-50/50 min-w-[150px]">
                  <div>Tổng (Ads + phí)</div>
                  <div className="text-[10px] font-normal text-blue-400">(Ads + Phí)</div>
                </th>
                <th className="px-4 py-4 font-bold text-orange-600 border-b border-r text-right min-w-[140px]">
                  <div>Ngưỡng</div>
                  <div className="text-[10px] font-normal text-orange-400">(Ngưỡng)</div>
                </th>
                <th className="px-4 py-4 font-bold text-purple-600 border-b border-r text-right min-w-[130px]">
                  <div>Chiết khấu</div>
                  <div className="text-[10px] font-normal text-purple-400">(Giảm trừ)</div>
                </th>
                <th className="px-4 py-4 font-bold text-green-600 border-b border-r text-right min-w-[140px]">
                  <div>Đã thanh toán</div>
                  <div className="text-[10px] font-normal text-green-400">(Tổng đã chuyển cho nguồn)</div>
                </th>
                <th className="px-4 py-4 font-bold text-red-600 border-b text-right min-w-[150px]">
                  <div>Công nợ</div>
                  <div className="text-[10px] font-normal text-red-400">(Dư + Phí + Ads Thẻ Nguồn + Ngưỡng - Chiết khấu - Đã TT)</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {data && data.length > 0 ? (
                data.map((item) => (
                  <tr 
                    key={item.sourceId} 
                    onClick={() => handleRowClick(item)}
                    className="hover:bg-blue-50/50 transition-all cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-bold text-gray-800 border-r border-gray-100 group-hover:text-blue-600 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                {item.sourceName.charAt(0).toUpperCase()}
                            </div>
                            {item.sourceName}
                        </div>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-700 border-r border-gray-100 font-medium">{formatNumber(item.openingBalance)}</td>
                    <td className="px-4 py-4 text-right text-gray-700 border-r border-gray-100 font-medium">{formatNumber(item.totalAds)}</td>
                    <td className="px-4 py-4 text-right text-gray-500 border-r border-gray-100">{formatNumber(item.totalFee)}</td>
                    <td className="px-4 py-4 text-right font-bold text-blue-700 bg-blue-50/30 border-r border-blue-100">{formatNumber(item.totalAdsPlusFee)}</td>
                    <td className="px-4 py-4 text-right text-orange-600 border-r border-gray-100 font-medium">{formatNumber(item.totalThreshold)}</td>
                    <td className="px-4 py-4 text-right text-purple-600 border-r border-gray-100 font-medium">{formatNumber(item.manualDiscount)}</td>
                    <td className="px-4 py-4 text-right text-green-600 border-r border-gray-100 font-medium">{formatNumber(item.paid)}</td>
                    <td className={`px-4 py-4 text-right font-bold ${item.currentDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatNumber(item.currentDebt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 bg-gray-50 italic">
                    <div className="flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 text-gray-300" />
                        Không có dữ liệu công nợ cho tháng này
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {/* Footer Totals */}
            {data && data.length > 0 && (
                <tfoot className="bg-gray-100 font-bold border-t-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] sticky bottom-0 z-20">
                    <tr>
                        <td className="px-6 py-4 uppercase text-gray-600" colSpan={1}>Tổng cộng</td>
                        <td className="px-4 py-4 text-right text-gray-800 border-r border-gray-200">{formatNumber(totals.openingBalance)}</td>
                        <td className="px-4 py-4 text-right text-gray-800 border-r border-gray-200">{formatNumber(totals.totalAds)}</td>
                        <td className="px-4 py-4 text-right text-gray-800 border-r border-gray-200">{formatNumber(totals.totalFee)}</td>
                        <td className="px-4 py-4 text-right text-blue-800 bg-blue-100/50 border-r border-blue-200">{formatNumber(totals.totalAdsPlusFee)}</td>
                        <td className="px-4 py-4 text-right text-orange-700 border-r border-gray-200">{formatNumber(totals.totalThreshold)}</td>
                        <td className="px-4 py-4 text-right text-purple-700 border-r border-gray-200">{formatNumber(totals.manualDiscount)}</td>
                        <td className="px-4 py-4 text-right text-green-700 border-r border-gray-200">{formatNumber(totals.paid)}</td>
                        <td className="px-4 py-4 text-right text-red-700">{formatNumber(totals.currentDebt)}</td>
                    </tr>
                </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSource && (
          <SourceDetailModal 
            open={detailModalOpen}
            onClose={() => setDetailModalOpen(false)}
            source={selectedSource}
            year={year}
            month={month}
          />
      )}
    </div>
  );
};

export default MonthlySourceStats;

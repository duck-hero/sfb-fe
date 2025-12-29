import React, { useState, useEffect } from "react";
import { Loader2, Calendar, FileText, SquarePen, Users, User, ArrowUpRight, ArrowDownRight, BadgeCent } from "lucide-react";
import adsAccountApi from "../../api/adsAccountApi";
import { toast } from "react-toastify";
import RecordThresholdEatingModal from "./RecordThresholdEatingModal";
import dayjs from "dayjs";

const ThresholdStats = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await adsAccountApi.getThresholdStats(year, month);
      if (response.success) {
        setData(response.data || []);
      } else {
        toast.error(response.message || "Không thể tải dữ liệu thống kê");
      }
    } catch (error) {
      console.error("Error fetching threshold stats:", error);
      toast.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [year, month]);

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    return num.toLocaleString("vi-VN");
  };

  const years = Array.from({ length: 3 }, (_, i) => dayjs().year() - i);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BadgeCent className="w-5 h-5 text-primary-darkest" />
          Thống kê ngưỡng tháng {month}/{year}
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
              {years.map(y => (
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
        <div className="overflow-x-auto border rounded-xl scrollbar-thin scrollbar-thumb-gray-200">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap min-w-[250px]">Tài khoản quảng cáo</th>
                <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">BM Gốc</th>
                <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">Nguồn BM</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-right whitespace-nowrap">Ngưỡng</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-right whitespace-nowrap">Cắt nguồn</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-right whitespace-nowrap">Cắt khách</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-right whitespace-nowrap">Cắt cho vận hành</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-right whitespace-nowrap text-primary-darkest">Còn lại</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-center whitespace-nowrap">Khách hàng chi tiết</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-center whitespace-nowrap">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data && data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900 leading-tight">{item.adAccountIdNumber}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.adAccountName}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.bmName || "-"}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.bmSourceName || "-"}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{formatNumber(item.totalAmount)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatNumber(item.sourceAmount)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      <div className="flex items-center justify-end gap-1">
                        {formatNumber(item.customerTotalAmount)}
                        <Users className="w-3 h-3 text-gray-400" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatNumber(item.operatorAmount)}</td>
                    <td className="px-4 py-3 text-right font-black text-primary-darkest bg-primary-50">
                      {formatNumber(item.finalAgcProfit)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 justify-center max-w-[200px] mx-auto">
                        {item.customerShares && item.customerShares.map((share, idx) => (
                          <div key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-[10px] whitespace-nowrap" title={share.customerName}>
                            {share.customerName}: <span className="font-bold">{formatNumber(share.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => {
                          setSelectedRecord(item);
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-warning hover:bg-warning-50 rounded-lg transition-all"
                        title="Chỉnh sửa thông tin cắn ngưỡng"
                      >
                        <SquarePen className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-20 text-center text-gray-500 italic bg-gray-50">
                    Chưa có dữ liệu thống kê cho tháng này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reusing Modal for Editing */}
      <RecordThresholdEatingModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        existingRecord={selectedRecord}
        onSuccess={() => fetchStats()}
      />
    </div>
  );
};

export default ThresholdStats;
